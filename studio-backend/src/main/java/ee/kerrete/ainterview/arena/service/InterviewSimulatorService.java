package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.InterviewSimRespondRequest;
import ee.kerrete.ainterview.arena.dto.InterviewSimResponse;
import ee.kerrete.ainterview.arena.dto.InterviewSimStartRequest;
import ee.kerrete.ainterview.arena.model.ArenaSession;
import ee.kerrete.ainterview.arena.repository.ArenaSessionRepository;
import ee.kerrete.ainterview.service.AiService;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewSimulatorService {

    private final AiService aiService;
    private final ArenaSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    private static final int TOTAL_QUESTIONS = 5;

    public InterviewSimResponse startSession(InterviewSimStartRequest request, Long userId) {
        // Generate first question
        String systemPrompt = """
            You are a professional interviewer conducting a %s interview for a %s position (%s level).
            Generate the first interview question.
            Return ONLY valid JSON (no markdown):
            {"question": "your interview question here"}
            """.formatted(
                request.interviewType() != null ? request.interviewType() : "behavioral",
                request.targetRole(),
                request.experienceLevel() != null ? request.experienceLevel() : "mid-level"
            );

        String aiResponse = aiService.createChatCompletion(systemPrompt, "Start the interview with your first question.");

        String question;
        try {
            var node = objectMapper.readTree(stripCodeFence(aiResponse.trim()));
            question = node.path("question").asText("Tell me about yourself and your experience.");
        } catch (Exception e) {
            question = "Tell me about yourself and your relevant experience for this role.";
        }

        // Create session
        SessionState state = new SessionState();
        state.targetRole = request.targetRole();
        state.interviewType = request.interviewType() != null ? request.interviewType() : "behavioral";
        state.experienceLevel = request.experienceLevel() != null ? request.experienceLevel() : "mid-level";
        state.currentQuestion = 1;
        state.questions = new ArrayList<>();
        state.questions.add(question);
        state.answers = new ArrayList<>();

        ArenaSession session = ArenaSession.builder()
            .userId(userId)
            .toolType("interview-simulator")
            .sessionData(toJson(state))
            .build();
        session = sessionRepository.save(session);

        return InterviewSimResponse.builder()
            .sessionId(session.getId())
            .question(question)
            .questionNumber(1)
            .totalQuestions(TOTAL_QUESTIONS)
            .isComplete(false)
            .build();
    }

    public InterviewSimResponse respond(InterviewSimRespondRequest request, Long userId) {
        ArenaSession session = sessionRepository.findById(request.sessionId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        SessionState state;
        try {
            state = objectMapper.readValue(session.getSessionData(), SessionState.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Corrupted session");
        }

        state.answers.add(request.answer());

        // Check if interview is complete
        if (state.currentQuestion >= TOTAL_QUESTIONS) {
            return endSession(session, state);
        }

        // Generate next question + feedback on current answer
        String history = buildConversationHistory(state);
        String systemPrompt = """
            You are a professional interviewer conducting a %s interview for a %s position.
            Based on the conversation so far, provide brief feedback on the last answer and ask the next question.
            Return ONLY valid JSON (no markdown):
            {"feedback": "1-2 sentence feedback on the answer", "question": "your next interview question"}
            """.formatted(state.interviewType, state.targetRole);

        String aiResponse = aiService.createChatCompletion(systemPrompt, history);

        String nextQuestion;
        String feedback;
        try {
            var node = objectMapper.readTree(stripCodeFence(aiResponse.trim()));
            nextQuestion = node.path("question").asText("Can you elaborate on that?");
            feedback = node.path("feedback").asText("");
        } catch (Exception e) {
            nextQuestion = "Can you tell me more about a challenging situation you've faced?";
            feedback = "Thank you for your answer.";
        }

        state.currentQuestion++;
        state.questions.add(nextQuestion);
        session.setSessionData(toJson(state));
        sessionRepository.save(session);

        return InterviewSimResponse.builder()
            .sessionId(session.getId())
            .question(nextQuestion)
            .feedback(feedback)
            .questionNumber(state.currentQuestion)
            .totalQuestions(TOTAL_QUESTIONS)
            .isComplete(false)
            .build();
    }

    public InterviewSimResponse endSession(Long sessionId, Long userId) {
        ArenaSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        SessionState state;
        try {
            state = objectMapper.readValue(session.getSessionData(), SessionState.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Corrupted session");
        }

        return endSession(session, state);
    }

    private InterviewSimResponse endSession(ArenaSession session, SessionState state) {
        String history = buildConversationHistory(state);
        String systemPrompt = """
            You are a professional interviewer. The interview is complete.
            Provide a comprehensive evaluation of the candidate's performance.
            Return ONLY valid JSON (no markdown):
            {
              "overallScore": 0-100,
              "strengths": ["strength 1", "strength 2"],
              "weaknesses": ["weakness 1", "weakness 2"],
              "verdict": "STRONG_HIRE / HIRE / LEAN_HIRE / LEAN_NO_HIRE / NO_HIRE",
              "improvementPlan": "2-3 sentences of specific advice"
            }
            """;

        String aiResponse = aiService.createChatCompletion(systemPrompt, history + "\n\nProvide your final evaluation.");

        InterviewSimResponse.InterviewFeedback feedback;
        try {
            feedback = objectMapper.readValue(stripCodeFence(aiResponse.trim()),
                InterviewSimResponse.InterviewFeedback.class);
        } catch (Exception e) {
            feedback = InterviewSimResponse.InterviewFeedback.builder()
                .overallScore(50)
                .strengths(List.of("Completed the interview"))
                .weaknesses(List.of("Could not generate detailed feedback"))
                .verdict("LEAN_HIRE")
                .improvementPlan("Practice with more mock interviews and prepare STAR-format answers.")
                .build();
        }

        session.setFeedback(toJson(feedback));
        sessionRepository.save(session);

        return InterviewSimResponse.builder()
            .sessionId(session.getId())
            .isComplete(true)
            .questionNumber(TOTAL_QUESTIONS)
            .totalQuestions(TOTAL_QUESTIONS)
            .finalFeedback(feedback)
            .build();
    }

    private String buildConversationHistory(SessionState state) {
        StringBuilder sb = new StringBuilder();
        sb.append("Interview for: ").append(state.targetRole).append(" (").append(state.interviewType).append(")\n\n");
        for (int i = 0; i < state.questions.size(); i++) {
            sb.append("Q").append(i + 1).append(": ").append(state.questions.get(i)).append("\n");
            if (i < state.answers.size()) {
                sb.append("A").append(i + 1).append(": ").append(state.answers.get(i)).append("\n\n");
            }
        }
        return sb.toString();
    }

    private String stripCodeFence(String raw) {
        if (raw.startsWith("```")) {
            int first = raw.indexOf('\n');
            int lastFence = raw.lastIndexOf("```");
            if (first >= 0 && lastFence > first) {
                return raw.substring(first + 1, lastFence).trim();
            }
        }
        return raw;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    static class SessionState {
        String targetRole;
        String interviewType;
        String experienceLevel;
        int currentQuestion;
        List<String> questions = new ArrayList<>();
        List<String> answers = new ArrayList<>();
    }
}
