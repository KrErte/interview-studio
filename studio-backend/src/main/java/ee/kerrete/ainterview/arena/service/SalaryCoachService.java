package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.SalaryCoachMessageRequest;
import ee.kerrete.ainterview.arena.dto.SalaryCoachResponse;
import ee.kerrete.ainterview.arena.dto.SalaryCoachStartRequest;
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
public class SalaryCoachService {

    private final AiService aiService;
    private final ArenaSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    public SalaryCoachResponse startSession(SalaryCoachStartRequest request, Long userId) {
        String systemPrompt = """
            You are an expert salary negotiation coach with deep knowledge of tech market rates.
            Analyze the candidate's situation and provide initial negotiation strategy.
            Return ONLY valid JSON (no markdown):
            {
              "message": "Your personalized coaching advice (2-3 paragraphs)",
              "marketAnalysis": "Brief market rate analysis for this role and location",
              "negotiationStrategies": ["strategy 1", "strategy 2", "strategy 3"],
              "recommendedCounter": "Recommended counter-offer amount or range",
              "talkingPoints": ["key talking point 1", "key talking point 2", "key talking point 3"]
            }
            """;

        String userPrompt = """
            Role: %s
            Current salary: %s
            Offered salary: %s
            Location: %s
            Years of experience: %s

            Please analyze my situation and provide negotiation strategy.
            """.formatted(
                request.targetRole(),
                request.currentSalary() != null ? request.currentSalary() : "Not specified",
                request.offeredSalary() != null ? request.offeredSalary() : "Not specified",
                request.location() != null ? request.location() : "Not specified",
                request.experienceYears() != null ? request.experienceYears() : "Not specified"
            );

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        // Save session
        CoachState state = new CoachState();
        state.targetRole = request.targetRole();
        state.context = userPrompt;
        state.messages = new ArrayList<>();
        state.messages.add(new ChatEntry("user", userPrompt));
        state.messages.add(new ChatEntry("coach", aiResponse));

        ArenaSession session = ArenaSession.builder()
            .userId(userId)
            .toolType("salary-coach")
            .sessionData(toJson(state))
            .build();
        session = sessionRepository.save(session);

        try {
            SalaryCoachResponse response = objectMapper.readValue(stripCodeFence(aiResponse.trim()), SalaryCoachResponse.class);
            response.setSessionId(session.getId());
            return response;
        } catch (Exception e) {
            return SalaryCoachResponse.builder()
                .sessionId(session.getId())
                .message(aiResponse)
                .negotiationStrategies(List.of())
                .talkingPoints(List.of())
                .build();
        }
    }

    public SalaryCoachResponse message(SalaryCoachMessageRequest request, Long userId) {
        ArenaSession session = sessionRepository.findById(request.sessionId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        CoachState state;
        try {
            state = objectMapper.readValue(session.getSessionData(), CoachState.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Corrupted session");
        }

        state.messages.add(new ChatEntry("user", request.message()));

        String history = buildHistory(state);
        String systemPrompt = """
            You are an expert salary negotiation coach. Continue the coaching conversation.
            Provide specific, actionable advice based on the ongoing discussion.
            Return ONLY valid JSON (no markdown):
            {
              "message": "Your coaching response (be specific and actionable)",
              "talkingPoints": ["any new talking points if relevant"]
            }
            """;

        String aiResponse = aiService.createChatCompletion(systemPrompt, history);
        state.messages.add(new ChatEntry("coach", aiResponse));

        session.setSessionData(toJson(state));
        sessionRepository.save(session);

        try {
            SalaryCoachResponse response = objectMapper.readValue(stripCodeFence(aiResponse.trim()), SalaryCoachResponse.class);
            response.setSessionId(session.getId());
            return response;
        } catch (Exception e) {
            return SalaryCoachResponse.builder()
                .sessionId(session.getId())
                .message(aiResponse)
                .talkingPoints(List.of())
                .build();
        }
    }

    private String buildHistory(CoachState state) {
        StringBuilder sb = new StringBuilder();
        sb.append("Context: Salary negotiation coaching for ").append(state.targetRole).append("\n\n");
        for (ChatEntry entry : state.messages) {
            sb.append(entry.role.equals("user") ? "User" : "Coach").append(": ").append(entry.content).append("\n\n");
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
    static class CoachState {
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
