package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.LinkedinGeneratorRequest;
import ee.kerrete.ainterview.arena.dto.LinkedinGeneratorResponse;
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
public class LinkedinGeneratorService {

    private final AiService aiService;
    private final ArenaSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    public LinkedinGeneratorResponse generate(LinkedinGeneratorRequest request, Long userId) {
        String systemPrompt = """
            You are an expert LinkedIn profile writer who creates compelling, professional profiles.
            Generate a complete LinkedIn profile optimization including headline, about section, and experience bullets.
            Return ONLY valid JSON (no markdown):
            {
              "headline": "Professional headline (max 220 chars, keyword-rich)",
              "aboutSection": "Compelling about section (2-3 paragraphs, first-person, story-driven)",
              "experienceBullets": ["achievement bullet 1", "achievement bullet 2", "achievement bullet 3", "achievement bullet 4", "achievement bullet 5"],
              "skillsToHighlight": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5"],
              "summary": "Brief summary of the optimization strategy"
            }
            """;

        String userPrompt = """
            Target Role: %s
            Experience: %s
            Key Skills: %s
            Desired Tone: %s

            Please generate optimized LinkedIn profile content.
            """.formatted(
                request.targetRole(),
                request.experience() != null ? request.experience() : "Not specified",
                request.skills() != null ? request.skills() : "Not specified",
                request.tone() != null ? request.tone() : "Professional"
            );

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        ArenaSession session = ArenaSession.builder()
            .userId(userId)
            .toolType("linkedin-generator")
            .sessionData(aiResponse)
            .build();
        session = sessionRepository.save(session);

        try {
            LinkedinGeneratorResponse response = objectMapper.readValue(stripCodeFence(aiResponse.trim()), LinkedinGeneratorResponse.class);
            response.setSessionId(session.getId());
            return response;
        } catch (Exception e) {
            return LinkedinGeneratorResponse.builder()
                .sessionId(session.getId())
                .headline("")
                .aboutSection(aiResponse)
                .experienceBullets(List.of())
                .skillsToHighlight(List.of())
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
