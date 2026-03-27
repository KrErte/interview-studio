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
        int answeredCount = state.answers.size();
        boolean endedEarly = answeredCount < TOTAL_QUESTIONS;

        String systemPrompt = """
            You are a professional interviewer. The interview %s.
            The candidate answered %d out of %d questions.
            Evaluate the candidate BASED ON THE ANSWERS THEY ACTUALLY GAVE.
            Even if the interview was short, analyze the specific content of each answer.
            Do NOT give generic feedback — reference their actual responses.
            Return ONLY valid JSON (no markdown):
            {
              "overallScore": 0-100,
              "strengths": ["strength 1", "strength 2"],
              "weaknesses": ["weakness 1", "weakness 2"],
              "verdict": "STRONG_HIRE / HIRE / LEAN_HIRE / LEAN_NO_HIRE / NO_HIRE",
              "improvementPlan": "2-3 sentences of specific advice"
            }
            """.formatted(
                endedEarly ? "was ended early by the candidate" : "is complete",
                answeredCount,
                TOTAL_QUESTIONS
            );

        String aiResponse = aiService.createChatCompletion(systemPrompt, history + "\n\nProvide your final evaluation based on the answers given.");

        InterviewSimResponse.InterviewFeedback feedback;
        try {
            feedback = objectMapper.readValue(stripCodeFence(aiResponse.trim()),
                InterviewSimResponse.InterviewFeedback.class);
        } catch (Exception e) {
            log.warn("Failed to parse interview feedback AI response: {}", aiResponse, e);
            // Build meaningful fallback based on actual answers
            List<String> strengths = new ArrayList<>();
            List<String> weaknesses = new ArrayList<>();
            if (answeredCount > 0) {
                strengths.add("Provided " + answeredCount + " answer(s) during the interview");
                strengths.add("Showed willingness to engage with interview questions");
            } else {
                strengths.add("Initiated the interview process");
            }
            if (endedEarly) {
                weaknesses.add("Interview ended early — only " + answeredCount + " of " + TOTAL_QUESTIONS + " questions answered");
                weaknesses.add("More answers would provide a better evaluation");
            } else {
                weaknesses.add("Unable to generate detailed AI feedback for this session");
            }
            int score = Math.max(20, Math.min(70, answeredCount * 15 + 20));
            String verdict = score >= 60 ? "LEAN_HIRE" : "LEAN_NO_HIRE";
            feedback = InterviewSimResponse.InterviewFeedback.builder()
                .overallScore(score)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .verdict(verdict)
                .improvementPlan("Complete all " + TOTAL_QUESTIONS + " questions for a thorough evaluation. Practice STAR-format answers for behavioral questions.")
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

    public ee.kerrete.ainterview.arena.api.InterviewSimulatorController.InterviewRoadmapResponse generateRoadmap(
            ee.kerrete.ainterview.arena.api.InterviewSimulatorController.InterviewRoadmapRequest request) {

        String systemPrompt = """
            You are a career coach. Based on interview weaknesses, create a 4-week improvement roadmap.
            Return ONLY valid JSON (no markdown):
            {
              "weeks": [
                {
                  "week": 1,
                  "theme": "Week theme",
                  "tasks": ["task 1", "task 2", "task 3"],
                  "milestone": "What to achieve by end of week"
                }
              ],
              "summary": "1-2 sentence overview of the plan"
            }
            Create exactly 4 weeks. Make tasks specific and actionable based on the weaknesses provided.
            """;

        String userPrompt = "Target role: " + request.targetRole() +
            "\nWeaknesses identified: " + String.join(", ", request.weaknesses()) +
            (request.improvementPlan() != null ? "\nImprovement advice: " + request.improvementPlan() : "");

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        try {
            return objectMapper.readValue(stripCodeFence(aiResponse.trim()),
                ee.kerrete.ainterview.arena.api.InterviewSimulatorController.InterviewRoadmapResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse roadmap AI response: {}", aiResponse, e);
            // Fallback
            var weeks = request.weaknesses().stream().limit(4).map(w ->
                new ee.kerrete.ainterview.arena.api.InterviewSimulatorController.RoadmapWeek(
                    request.weaknesses().indexOf(w) + 1,
                    "Improve: " + w,
                    List.of("Research best practices for " + w, "Practice daily", "Get feedback from peers"),
                    "Measurable improvement in " + w
                )
            ).toList();
            return new ee.kerrete.ainterview.arena.api.InterviewSimulatorController.InterviewRoadmapResponse(
                weeks, "Personalized improvement plan based on your interview results.");
        }
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
