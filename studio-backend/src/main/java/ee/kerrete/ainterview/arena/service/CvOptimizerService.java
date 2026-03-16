package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.CvOptimizerResponse;
import ee.kerrete.ainterview.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvOptimizerService {

    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public CvOptimizerResponse analyze(MultipartFile cvFile, String targetRole) {
        String cvText = extractText(cvFile);

        if (cvText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not extract text from PDF");
        }

        String systemPrompt = """
            You are an expert ATS (Applicant Tracking System) specialist and CV/resume coach.
            Analyze the given CV against the target role and provide detailed optimization advice.

            Return ONLY valid JSON (no markdown, no code fences):
            {
              "atsScore": 0-100,
              "missingKeywords": ["keyword the CV should include for ATS"],
              "sectionFeedback": [
                {
                  "section": "section name (e.g., Summary, Experience, Skills)",
                  "status": "GOOD / NEEDS_WORK / MISSING",
                  "suggestion": "specific improvement suggestion"
                }
              ],
              "impactImprovements": ["rewrite suggestion with quantified impact"],
              "linkedInTips": ["tip for improving LinkedIn profile based on CV"],
              "overallSummary": "2-3 sentence overall assessment"
            }
            Keep arrays to max 5 items each.
            """;

        String userPrompt = "Target role: " + (targetRole != null ? targetRole : "Not specified") +
            "\n\nCV content:\n" + cvText;

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        try {
            String cleaned = stripCodeFence(aiResponse.trim());
            return objectMapper.readValue(cleaned, CvOptimizerResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse CV optimizer AI response: {}", aiResponse, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to analyze CV");
        }
    }

    private String extractText(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType != null && contentType.contains("pdf")) {
                try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(document);
                }
            }
            // Fall back to treating as plain text
            return new String(file.getBytes());
        } catch (Exception e) {
            log.error("Failed to extract text from uploaded file", e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded file");
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
