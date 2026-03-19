package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.CoverLetterRequest;
import ee.kerrete.ainterview.arena.dto.CoverLetterResponse;
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
public class CoverLetterService {

    private final AiService aiService;
    private final ArenaSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    public CoverLetterResponse generate(CoverLetterRequest request, Long userId) {
        String systemPrompt = """
            You are an expert cover letter writer who creates compelling, tailored cover letters.
            Analyze the job description and create a professional cover letter that highlights relevant experience.
            Return ONLY valid JSON (no markdown):
            {
              "coverLetter": "Full cover letter text (3-4 paragraphs, professional format)",
              "highlights": ["key strength highlighted 1", "key strength highlighted 2", "key strength highlighted 3"],
              "tone": "Description of the tone used",
              "summary": "Brief explanation of the approach taken"
            }
            """;

        String userPrompt = """
            Job Description: %s

            Key Experience: %s

            Desired Tone: %s

            Please generate a tailored cover letter for this position.
            """.formatted(
                request.jobDescription(),
                request.keyExperience() != null ? request.keyExperience() : "Not specified",
                request.tone() != null ? request.tone() : "Professional"
            );

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        ArenaSession session = ArenaSession.builder()
            .userId(userId)
            .toolType("cover-letter")
            .sessionData(aiResponse)
            .build();
        session = sessionRepository.save(session);

        try {
            CoverLetterResponse response = objectMapper.readValue(stripCodeFence(aiResponse.trim()), CoverLetterResponse.class);
            response.setSessionId(session.getId());
            return response;
        } catch (Exception e) {
            return CoverLetterResponse.builder()
                .sessionId(session.getId())
                .coverLetter(aiResponse)
                .highlights(List.of())
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
