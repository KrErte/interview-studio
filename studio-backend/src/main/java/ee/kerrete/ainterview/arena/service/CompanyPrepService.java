package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.CompanyPrepRequest;
import ee.kerrete.ainterview.arena.dto.CompanyPrepResponse;
import ee.kerrete.ainterview.arena.model.ArenaSession;
import ee.kerrete.ainterview.arena.repository.ArenaSessionRepository;
import ee.kerrete.ainterview.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyPrepService {

    private final AiService aiService;
    private final ArenaSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    public CompanyPrepResponse analyze(CompanyPrepRequest request, Long userId) {
        String systemPrompt = """
            You are an expert interview preparation coach with deep knowledge of company cultures and hiring practices.
            Analyze the target company and role, then provide comprehensive interview preparation guidance.
            Return ONLY valid JSON (no markdown):
            {
              "companyOverview": "Brief overview of the company, its mission, and industry position",
              "cultureInsights": "Key culture insights - work style, values, team dynamics",
              "commonQuestions": ["likely interview question 1", "likely question 2", "likely question 3", "likely question 4", "likely question 5"],
              "whatTheyValue": ["value 1", "value 2", "value 3"],
              "prepTips": ["specific prep tip 1", "specific prep tip 2", "specific prep tip 3", "specific prep tip 4"],
              "redFlags": ["things to watch out for 1", "things to watch out for 2"]
            }
            """;

        String userPrompt = """
            Company: %s
            Target Role: %s
            Experience Level: %s

            Please provide comprehensive interview preparation for this company and role.
            """.formatted(
                request.companyName(),
                request.targetRole(),
                request.experienceLevel() != null ? request.experienceLevel() : "Not specified"
            );

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        ArenaSession session = ArenaSession.builder()
            .userId(userId)
            .toolType("company-prep")
            .sessionData(aiResponse)
            .build();
        session = sessionRepository.save(session);

        try {
            CompanyPrepResponse response = objectMapper.readValue(stripCodeFence(aiResponse.trim()), CompanyPrepResponse.class);
            response.setSessionId(session.getId());
            return response;
        } catch (Exception e) {
            return CompanyPrepResponse.builder()
                .sessionId(session.getId())
                .companyOverview(aiResponse)
                .commonQuestions(List.of())
                .whatTheyValue(List.of())
                .prepTips(List.of())
                .redFlags(List.of())
                .build();
        }
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
}
