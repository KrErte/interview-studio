package ee.kerrete.ainterview.service;

import ee.kerrete.ainterview.config.OpenAiProperties;
import ee.kerrete.ainterview.dto.AiHealthStatusDto;
import ee.kerrete.ainterview.service.OpenAiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiHealthCheckService {

    private final OpenAiClient openAiClient;
    private final OpenAiProperties openAiProperties;

    private volatile AiHealthStatusDto cachedDeepResult;
    private volatile Instant cachedAt;
    private static final long CACHE_TTL_SECONDS = 60;
    private static final long DEEP_TIMEOUT_SECONDS = 5;

    public AiHealthStatusDto check(boolean deep) {
        Instant now = Instant.now();

        if (!deep) {
            return AiHealthStatusDto.builder()
                    .ok(true)
                    .service("trainer")
                    .ts(now)
                    .aiOk(null)
                    .build();
        }

        if (cachedDeepResult != null && cachedAt != null &&
                cachedAt.isAfter(now.minusSeconds(CACHE_TTL_SECONDS))) {
            return cachedDeepResult;
        }

        long start = System.currentTimeMillis();
        String model = openAiProperties.getModel();

        try {
            String response = CompletableFuture.supplyAsync(() ->
                            openAiClient.complete("Ping. Respond with 'pong'."))
                    .get(DEEP_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            long latency = System.currentTimeMillis() - start;
            boolean aiOk = response != null && !response.isBlank();

            AiHealthStatusDto result = AiHealthStatusDto.builder()
                    .ok(true)
                    .service("trainer")
                    .ts(Instant.now())
                    .aiOk(aiOk)
                    .aiLatencyMs(latency)
                    .modelUsed(model)
                    .errorSummary(aiOk ? null : "Empty response from OpenAI")
                    .build();

            cachedDeepResult = result;
            cachedAt = Instant.now();
            return result;
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            log.warn("Trainer AI health deep check failed: {}", e.getMessage());

            AiHealthStatusDto result = AiHealthStatusDto.builder()
                    .ok(true)
                    .service("trainer")
                    .ts(Instant.now())
                    .aiOk(false)
                    .aiLatencyMs(latency)
                    .modelUsed(model)
                    .errorSummary(shortMessage(e))
                    .build();

            cachedDeepResult = result;
            cachedAt = Instant.now();
            return result;
        }
    }

    private String shortMessage(Exception e) {
        String msg = e.getMessage();
        if (msg == null || msg.isBlank()) {
            return e.getClass().getSimpleName();
        }
        return msg.length() > 160 ? msg.substring(0, 160) : msg;
    }
}

