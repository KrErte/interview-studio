package ee.kerrete.ainterview.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.config.ClaudeProperties;
import ee.kerrete.ainterview.model.Question;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@Primary
@Slf4j
public class ClaudeApiService implements AiService {

    private final ClaudeProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ClaudeApiService(ClaudeProperties properties) {
        this.properties = properties;
    }

    private String callClaude(String systemPrompt, List<ClaudeMessage> messages, int maxTokens) {
        String url = properties.getBaseUrl() + "/messages";

        ClaudeRequest body = ClaudeRequest.builder()
                .model(properties.getModel())
                .maxTokens(maxTokens)
                .system(systemPrompt)
                .messages(messages)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", properties.getApiKey());
        headers.set("anthropic-version", "2023-06-01");

        HttpEntity<ClaudeRequest> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<ClaudeResponse> response =
                    restTemplate.exchange(url, HttpMethod.POST, entity, ClaudeResponse.class);

            if (response.getBody() == null ||
                    response.getBody().content == null ||
                    response.getBody().content.isEmpty()) {
                return "AI did not return a response.";
            }

            return response.getBody().content.get(0).text.trim();
        } catch (Exception e) {
            log.error("Claude API request failed", e);
            return "Claude API request failed: " + e.getMessage();
        }
    }

    @Override
    public String complete(String prompt) {
        List<ClaudeMessage> messages = List.of(
                new ClaudeMessage("user", prompt)
        );
        return callClaude("You are a helpful AI assistant.", messages, 2048);
    }

    @Override
    public String createChatCompletion(String systemPrompt, String userPrompt) {
        List<ClaudeMessage> messages = List.of(
                new ClaudeMessage("user", userPrompt)
        );
        return callClaude(systemPrompt, messages, 2048);
    }

    @Override
    public String evaluateAnswer(String question, String answer) {
        String systemPrompt = """
                You are a senior software engineering interviewer.
                Evaluate candidate answers very practically.

                Return ONLY valid JSON, no markdown, no explanation.
                JSON structure:
                {
                  "score": 0-100,
                  "strengths": "short paragraph in Estonian",
                  "weaknesses": "short paragraph in Estonian",
                  "suggestions": "short practical tips in Estonian"
                }
                """;

        String userPrompt = """
                Küsimus:
                %s

                Kandidaadi vastus:
                %s
                """.formatted(question, answer);

        List<ClaudeMessage> messages = List.of(
                new ClaudeMessage("user", userPrompt)
        );

        return callClaude(systemPrompt, messages, 800);
    }

    @Override
    public List<Question> generateQuestionsFromCv(String cvText, int technicalCount, int softCount) {
        String systemPrompt = """
                You are a senior software engineer and technical interviewer.
                Generate realistic interview questions based on a candidate CV text.

                Return ONLY valid JSON array (no markdown), example:
                [
                  {
                    "id": "1",
                    "question": "Question text",
                    "difficulty": "TECH" or "SOFT",
                    "category": "JUNIOR" or "MID" or "SENIOR"
                  }
                ]
                """;

        String userPrompt = """
                Candidate CV:
                %s

                Generate %d technical questions (difficulty TECH)
                and %d soft-skill questions (difficulty SOFT).
                """.formatted(cvText, technicalCount, softCount);

        List<ClaudeMessage> messages = List.of(
                new ClaudeMessage("user", userPrompt)
        );

        String json = callClaude(systemPrompt, messages, 1200);

        try {
            Question[] arr = objectMapper.readValue(json, Question[].class);
            List<Question> result = new ArrayList<>();
            if (arr != null) {
                for (int i = 0; i < arr.length; i++) {
                    Question q = arr[i];
                    if (q.getId() == null || q.getId().isBlank()) {
                        q.setId(String.valueOf(i + 1));
                    }
                    result.add(q);
                }
            }
            if (result.isEmpty()) {
                result.add(new Question("1",
                        "Kirjelda üht huvitavat projekti oma CV-st.",
                        "SOFT", "MID"));
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to parse Claude question response", e);
            List<Question> fallback = new ArrayList<>();
            fallback.add(new Question("1", "Kirjelda REST API mõistet.", "TECH", "JUNIOR"));
            fallback.add(new Question("2", "Kuidas lahendaksid konflikti tiimis?", "SOFT", "MID"));
            return fallback;
        }
    }

    @Override
    public String generateSkillBoosterPlan(String jobMatcherSummary, List<String> focusSkills) {
        String systemPrompt = """
                You are a senior career coach for software engineers.
                Create a concise 21-day learning plan for selected skills.

                Return ONLY valid JSON (no markdown) with structure:
                {
                  "overallGoal": "one sentence in Estonian",
                  "days": [
                    {
                      "dayNumber": 1,
                      "title": "short title",
                      "description": "2-3 sentences of explanation (Estonian)",
                      "practiceTask": "1 concrete practice task (Estonian)"
                    }
                  ]
                }
                """;

        String skills = String.join(", ", focusSkills == null ? List.of() : focusSkills);

        String userPrompt = """
                Job Matcheri AI kokkuvõte:
                %s

                Fookusoskused, mida kandidaat soovib arendada:
                %s

                Koosta 21-päevane arenguplaan (days[0..20]).
                """.formatted(jobMatcherSummary, skills);

        List<ClaudeMessage> messages = List.of(
                new ClaudeMessage("user", userPrompt)
        );

        return callClaude(systemPrompt, messages, 1800);
    }

    // ============ DTOs for Claude API ============

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    static class ClaudeRequest {
        private String model;

        @JsonProperty("max_tokens")
        private int maxTokens;

        private String system;
        private List<ClaudeMessage> messages;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    static class ClaudeMessage {
        private String role;
        private String content;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class ClaudeResponse {
        public List<ContentBlock> content;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class ContentBlock {
        public String type;
        public String text;
    }
}
