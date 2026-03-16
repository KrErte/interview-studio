package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.JobXrayRequest;
import ee.kerrete.ainterview.arena.dto.JobXrayResponse;
import ee.kerrete.ainterview.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobXrayService {

    private final AiService aiService;
    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    private static final String FEATURE = "job-xray";
    private static final int FREE_LIMIT = 3;

    public JobXrayResponse analyze(JobXrayRequest request, Long userId, boolean isPro) {
        if (!isPro) {
            if (userId == null) {
                // Anonymous users get limited uses tracked by IP (simplified: no tracking for anon)
            } else if (!rateLimitService.canUse(userId, FEATURE, FREE_LIMIT)) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Free tier limit reached (3/month). Upgrade to Arena Pro for unlimited access.");
            }
        }

        String systemPrompt = """
            You are a senior career advisor and job market analyst.
            Analyze the given job description thoroughly.

            Return ONLY valid JSON (no markdown, no code fences) with this structure:
            {
              "seniority": "Junior/Mid/Senior/Lead/Principal",
              "realRequirements": ["must-have skill 1", "must-have skill 2"],
              "hiddenRequirements": ["implied requirement not explicitly stated"],
              "salaryEstimate": "$X - $Y range based on role and market",
              "redFlags": ["potential concern about this job"],
              "greenFlags": ["positive signal about this job"],
              "atsKeywords": ["keyword to include in resume for ATS"],
              "cultureSignals": "brief analysis of company culture from the posting",
              "fitTips": ["actionable tip to improve fit for this role"]
            }
            Keep arrays to max 5 items each. Be specific and actionable.
            """;

        String userPrompt = "Job description:\n" + request.jobDescription();
        if (request.targetRole() != null && !request.targetRole().isBlank()) {
            userPrompt += "\n\nCandidate's target role: " + request.targetRole();
        }

        String aiResponse = aiService.createChatCompletion(systemPrompt, userPrompt);

        try {
            String cleaned = stripCodeFence(aiResponse.trim());
            JobXrayResponse response = objectMapper.readValue(cleaned, JobXrayResponse.class);

            // Record usage
            if (userId != null) {
                rateLimitService.recordUsage(userId, FEATURE);
                long usage = rateLimitService.getUsageCount(userId, FEATURE);
                response.setUsageCount(usage);
                response.setUsageLimit(isPro ? -1 : FREE_LIMIT);
            }

            return response;
        } catch (Exception e) {
            log.error("Failed to parse Job X-Ray AI response: {}", aiResponse, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to analyze job description");
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
