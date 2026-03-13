package ee.kerrete.ainterview.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.model.UserTier;
import ee.kerrete.ainterview.payment.config.LemonSqueezyProperties;
import ee.kerrete.ainterview.payment.dto.CheckoutRequest;
import ee.kerrete.ainterview.payment.dto.CheckoutResponse;
import ee.kerrete.ainterview.payment.dto.TierResponse;
import ee.kerrete.ainterview.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final LemonSqueezyProperties properties;
    private final AppUserRepository appUserRepository;
    private final ObjectMapper objectMapper;
    private final OkHttpClient httpClient = new OkHttpClient();

    private static final String LS_API_BASE = "https://api.lemonsqueezy.com/v1";

    public CheckoutResponse createCheckout(Long userId, CheckoutRequest request) {
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserTier requestedTier;
        try {
            requestedTier = UserTier.valueOf(request.tier().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tier: " + request.tier());
        }

        if (requestedTier == UserTier.FREE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot purchase FREE tier");
        }

        if (user.getTier().isAtLeast(requestedTier)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already at tier " + user.getTier().name() + " or higher");
        }

        String variantId = properties.variantIdForTier(request.tier());

        try {
            String checkoutUrl = createLemonSqueezyCheckout(
                variantId,
                user.getEmail(),
                user.getId(),
                request.successUrl(),
                request.cancelUrl()
            );
            return new CheckoutResponse(checkoutUrl);
        } catch (Exception e) {
            log.error("Failed to create Lemon Squeezy checkout", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create checkout");
        }
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!verifySignature(payload, signature)) {
            log.warn("Invalid webhook signature");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid signature");
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventName = root.path("meta").path("event_name").asText();

            log.info("Received Lemon Squeezy webhook: {}", eventName);

            if ("order_created".equals(eventName)) {
                handleOrderCreated(root);
            }
        } catch (Exception e) {
            log.error("Failed to process webhook", e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to process webhook");
        }
    }

    public TierResponse getUserTier(Long userId) {
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new TierResponse(
            user.getTier().name(),
            user.getTierPurchasedAt() != null ? user.getTierPurchasedAt().toString() : null
        );
    }

    private void handleOrderCreated(JsonNode root) {
        JsonNode customData = root.path("meta").path("custom_data");
        long userId = customData.path("user_id").asLong(0);
        String tier = customData.path("tier").asText("");

        if (userId == 0 || tier.isBlank()) {
            log.warn("Webhook missing user_id or tier in custom_data");
            return;
        }

        UserTier newTier;
        try {
            newTier = UserTier.valueOf(tier.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid tier in webhook custom_data: {}", tier);
            return;
        }

        appUserRepository.findById(userId).ifPresent(user -> {
            if (newTier.isAtLeast(user.getTier())) {
                user.setTier(newTier);
                user.setTierPurchasedAt(LocalDateTime.now());
                appUserRepository.save(user);
                log.info("Upgraded user {} to tier {}", userId, newTier);
            } else {
                log.info("User {} already at tier {} (attempted {})", userId, user.getTier(), newTier);
            }
        });
    }

    private String createLemonSqueezyCheckout(
        String variantId, String email, Long userId,
        String successUrl, String cancelUrl
    ) throws Exception {
        // Determine tier from variant ID
        String tier = tierFromVariantId(variantId);

        String json = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
            put("data", new java.util.LinkedHashMap<>() {{
                put("type", "checkouts");
                put("attributes", new java.util.LinkedHashMap<>() {{
                    put("checkout_data", new java.util.LinkedHashMap<>() {{
                        put("email", email);
                        put("custom", new java.util.LinkedHashMap<>() {{
                            put("user_id", String.valueOf(userId));
                            put("tier", tier);
                        }});
                    }});
                    put("product_options", new java.util.LinkedHashMap<>() {{
                        put("redirect_url", successUrl);
                    }});
                }});
                put("relationships", new java.util.LinkedHashMap<>() {{
                    put("store", new java.util.LinkedHashMap<>() {{
                        put("data", new java.util.LinkedHashMap<>() {{
                            put("type", "stores");
                            put("id", properties.storeId());
                        }});
                    }});
                    put("variant", new java.util.LinkedHashMap<>() {{
                        put("data", new java.util.LinkedHashMap<>() {{
                            put("type", "variants");
                            put("id", variantId);
                        }});
                    }});
                }});
            }});
        }});

        Request request = new Request.Builder()
            .url(LS_API_BASE + "/checkouts")
            .header("Authorization", "Bearer " + properties.apiKey())
            .header("Accept", "application/vnd.api+json")
            .header("Content-Type", "application/vnd.api+json")
            .post(RequestBody.create(json, MediaType.parse("application/vnd.api+json")))
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String body = response.body() != null ? response.body().string() : "no body";
                log.error("Lemon Squeezy checkout creation failed: {} - {}", response.code(), body);
                throw new RuntimeException("Lemon Squeezy API error: " + response.code());
            }

            JsonNode respJson = objectMapper.readTree(response.body().string());
            return respJson.path("data").path("attributes").path("url").asText();
        }
    }

    private String tierFromVariantId(String variantId) {
        if (variantId.equals(properties.essentialsVariantId())) return "ESSENTIALS";
        if (variantId.equals(properties.professionalVariantId())) return "PROFESSIONAL";
        if (variantId.equals(properties.lifetimeVariantId())) return "LIFETIME";
        return "ESSENTIALS";
    }

    private boolean verifySignature(String payload, String signature) {
        if (signature == null || signature.isBlank()) return false;
        if (properties.webhookSecret() == null || properties.webhookSecret().isBlank()) {
            log.warn("Webhook secret not configured, skipping verification");
            return true;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                properties.webhookSecret().getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            ));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return computed.equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }
}
