package ee.kerrete.ainterview.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.stripe")
public record StripeProperties(
    String secretKey,
    String publishableKey,
    String webhookSecret,
    // USD price IDs
    String starterMonthlyPriceId,
    String starterAnnualPriceId,
    String proMonthlyPriceId,
    String proAnnualPriceId,
    // EUR price IDs
    String starterMonthlyEurPriceId,
    String starterAnnualEurPriceId,
    String proMonthlyEurPriceId,
    String proAnnualEurPriceId,
    // Legacy
    String arenaProPriceId
) {}
