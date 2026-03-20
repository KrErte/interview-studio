package ee.kerrete.ainterview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PracticeService {

    private final PracticeQuestionBank questionBank;
    private final ObjectMapper objectMapper;

    @Value("${openai.api-key:${OPENAI_API_KEY:dummy-openai-key}}")
    private String apiKey;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${openai.model:gpt-4.1-mini}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public PracticeSessionResponse createSession(PracticeSessionRequest request) {
        List<PracticeQuestionDto> questions = questionBank.getQuestionsFor(request.getBlockers());
        String sessionId = UUID.randomUUID().toString();
        return new PracticeSessionResponse(sessionId, questions);
    }

    public PracticeAnswerResponse evaluateAnswer(PracticeAnswerRequest request) {
        try {
            String prompt = buildEvalPrompt(request);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("response_format", Map.of("type", "json_object"));

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of(
                "role", "system",
                "content",
                "Sa oled kogenud karjääricoach. Hinda intervjuu harjutuse vastust skaalal 1-5 ja anna konkreetset tagasisidet. " +
                "Tagasta JSON: {\"score\": number, \"feedback\": \"string\", \"suggestion\": \"string\"}"
            ));
            messages.add(Map.of("role", "user", "content", prompt));
            requestBody.put("messages", messages);

            String url = baseUrl.endsWith("/chat/completions")
                ? baseUrl
                : baseUrl + "/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return fallbackResponse();
            }

            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String content = responseJson.path("choices").path(0).path("message").path("content").asText();

            String cleaned = content.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode json = objectMapper.readTree(cleaned);

            int score = Math.max(1, Math.min(5, json.path("score").asInt(3)));
            String feedback = json.path("feedback").asText("Hea katse!");
            String suggestion = json.path("suggestion").asText("Proovi vastust täpsustada konkreetsete näidetega.");

            return new PracticeAnswerResponse(score, feedback, suggestion);

        } catch (Exception e) {
            log.error("Viga harjutuse vastuse hindamisel", e);
            return fallbackResponse();
        }
    }

    private String buildEvalPrompt(PracticeAnswerRequest request) {
        return """
            Bloker: %s
            Sihtroll: %s
            Küsimus: %s
            Vastus: %s

            Hinda vastust skaalal 1-5:
            1 = väga nõrk (ebamäärane, ei vasta küsimusele)
            3 = keskmine (vastab, aga puuduvad konkreetsed näited)
            5 = suurepärane (selge struktuur, konkreetsed näited, vakuutav)

            Tagasta: {"score": number, "feedback": "mida tegi hästi ja mida mitte", "suggestion": "konkreetne soovitus parandamiseks"}
            """.formatted(
            request.getBlocker(),
            request.getTargetRole() != null ? request.getTargetRole() : "üldine",
            request.getQuestionText(),
            request.getAnswer()
        );
    }

    private PracticeAnswerResponse fallbackResponse() {
        return new PracticeAnswerResponse(
            3,
            "Vastus salvestatud. AI hindamine ajutiselt kättesaamatu.",
            "Proovi oma vastust täpsustada konkreetsete näidetega STAR-meetodil."
        );
    }
}
