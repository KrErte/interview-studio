package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.SalaryBenchmarkRequest;
import ee.kerrete.ainterview.arena.dto.SalaryBenchmarkResponse;
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
public class SalaryBenchmarkService {

    private final AiService aiService;
    private final ArenaSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    public SalaryBenchmarkResponse analyze(SalaryBenchmarkRequest request, Long userId) {
        String systemPrompt = """
            You are a salary data analyst with access to market salary benchmarks.
            Analyze the role, location, and experience to provide salary range data.
            Return ONLY valid JSON (no markdown):
            {
              "role": "Normalized role title",
              "location": "Location analyzed",
              "currency": "EUR",
              "minSalary": 45000,
              "medianSalary": 65000,
              "maxSalary": 95000,
              "p25": 52000,
              "p75": 80000,
              "locationComparisons": [
                {"location": "City 1", "medianSalary": 70000, "costOfLivingIndex": "High"},
                {"location": "City 2", "medianSalary": 55000, "costOfLivingIndex": "Medium"},
                {"location": "City 3", "medianSalary": 48000, "costOfLivingIndex": "Low"}
              ],
              "marketInsights": "Analysis of current market conditions for this role",
              "negotiationTips": ["tip 1", "tip 2", "tip 3"]
            }
            Use realistic salary figures based on current European market data.
            """;

        String userPrompt = """
            Role: %s
            Location: %s
            Experience Level: %s

            Please provide comprehensive salary benchmark data.
            """.formatted(
                request.targetRole(),
                request.location(),
                request.experienceLevel() != null ? request.experienceLevel() : "Mid-level"
            );

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        ArenaSession session = ArenaSession.builder()
            .userId(userId)
            .toolType("salary-benchmark")
            .sessionData(aiResponse)
            .build();
        session = sessionRepository.save(session);

        try {
            SalaryBenchmarkResponse response = objectMapper.readValue(stripCodeFence(aiResponse.trim()), SalaryBenchmarkResponse.class);
            response.setSessionId(session.getId());
            return response;
        } catch (Exception e) {
            return SalaryBenchmarkResponse.builder()
                .sessionId(session.getId())
                .role(request.targetRole())
                .location(request.location())
                .marketInsights(aiResponse)
                .negotiationTips(List.of())
                .locationComparisons(List.of())
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
