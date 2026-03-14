package ee.kerrete.ainterview.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.lemonsqueezy")
@Validated
public record LemonSqueezyProperties(
    String apiKey,
    String webhookSecret,
    String storeId,
    String essentialsVariantId,
    String professionalVariantId,
    String lifetimeVariantId,
    String arenaProVariantId
) {
    public String variantIdForTier(String tier) {
        return switch (tier.toUpperCase()) {
            case "ESSENTIALS" -> essentialsVariantId;
            case "PROFESSIONAL" -> professionalVariantId;
            case "LIFETIME" -> lifetimeVariantId;
            case "ARENA_PRO" -> arenaProVariantId;
            default -> throw new IllegalArgumentException("No variant for tier: " + tier);
        };
    }
}
