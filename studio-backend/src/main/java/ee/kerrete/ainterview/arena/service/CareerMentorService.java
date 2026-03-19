package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.CareerMentorMessageRequest;
import ee.kerrete.ainterview.arena.dto.CareerMentorResponse;
import ee.kerrete.ainterview.arena.dto.CareerMentorStartRequest;
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
public class CareerMentorService {

    private final AiService aiService;
    private final ArenaSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    public CareerMentorResponse startSession(CareerMentorStartRequest request, Long userId) {
        String systemPrompt = """
            You are an expert AI career mentor with deep knowledge of career development, industry trends, and professional growth strategies.
            Based on the user's situation, provide personalized career advice.
            Return ONLY valid JSON (no markdown):
            {
              "message": "Your personalized career mentoring advice (2-3 paragraphs)",
              "actionItems": ["specific action 1", "specific action 2", "specific action 3"],
              "resourceLinks": ["resource suggestion 1", "resource suggestion 2"],
              "careerOutlook": "Brief outlook on career trajectory and opportunities"
            }
            """;

        String userPrompt = """
            Target Role: %s
            Current Status: %s
            Experience Level: %s
            Main Challenge: %s

            Please analyze my career situation and provide mentoring advice.
            """.formatted(
                request.targetRole(),
                request.currentStatus() != null ? request.currentStatus() : "Not specified",
                request.experienceLevel() != null ? request.experienceLevel() : "Not specified",
                request.mainChallenge() != null ? request.mainChallenge() : "Not specified"
            );

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        MentorState state = new MentorState();
        state.targetRole = request.targetRole();
        state.context = userPrompt;
        state.messages = new ArrayList<>();
        state.messages.add(new ChatEntry("user", userPrompt));
        state.messages.add(new ChatEntry("mentor", aiResponse));

        ArenaSession session = ArenaSession.builder()
            .userId(userId)
            .toolType("career-mentor")
            .sessionData(toJson(state))
            .build();
        session = sessionRepository.save(session);

        try {
            CareerMentorResponse response = objectMapper.readValue(stripCodeFence(aiResponse.trim()), CareerMentorResponse.class);
            response.setSessionId(session.getId());
            return response;
        } catch (Exception e) {
            return CareerMentorResponse.builder()
                .sessionId(session.getId())
                .message(aiResponse)
                .actionItems(List.of())
                .resourceLinks(List.of())
                .build();
        }
    }

    public CareerMentorResponse message(CareerMentorMessageRequest request, Long userId) {
        ArenaSession session = sessionRepository.findById(request.sessionId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        MentorState state;
        try {
            state = objectMapper.readValue(session.getSessionData(), MentorState.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Corrupted session");
        }

        state.messages.add(new ChatEntry("user", request.message()));

        String history = buildHistory(state);
        String systemPrompt = """
            You are an expert AI career mentor. Continue the mentoring conversation.
            Provide specific, actionable career advice based on the ongoing discussion.
            Return ONLY valid JSON (no markdown):
            {
              "message": "Your mentoring response (be specific and actionable)",
              "actionItems": ["any new action items if relevant"]
            }
            """;

        String aiResponse = aiService.createChatCompletion(systemPrompt, history);
        state.messages.add(new ChatEntry("mentor", aiResponse));

        session.setSessionData(toJson(state));
        sessionRepository.save(session);

        try {
            CareerMentorResponse response = objectMapper.readValue(stripCodeFence(aiResponse.trim()), CareerMentorResponse.class);
            response.setSessionId(session.getId());
            return response;
        } catch (Exception e) {
            return CareerMentorResponse.builder()
                .sessionId(session.getId())
                .message(aiResponse)
                .actionItems(List.of())
                .build();
        }
    }

    private String buildHistory(MentorState state) {
        StringBuilder sb = new StringBuilder();
        sb.append("Context: Career mentoring for ").append(state.targetRole).append("\n\n");
        for (ChatEntry entry : state.messages) {
            sb.append(entry.role.equals("user") ? "User" : "Mentor").append(": ").append(entry.content).append("\n\n");
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
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return "{}"; }
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    static class MentorState {
        String targetRole;
        String context;
        List<ChatEntry> messages = new ArrayList<>();
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    static class ChatEntry {
        String role;
        String content;
    }
}
