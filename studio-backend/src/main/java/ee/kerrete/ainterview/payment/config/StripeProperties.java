package ee.kerrete.ainterview.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.stripe")
public record StripeProperties(
    String secretKey,
    String publishableKey,
    String webhookSecret,
    // New simplified price IDs (Starter = one-time, Pro = yearly subscription)
    String starterUsdPriceId,
    String starterEurPriceId,
    String proUsdPriceId,
    String proEurPriceId,
    // Legacy (kept for backward compat with existing subscribers)
    String starterMonthlyPriceId,
    String starterAnnualPriceId,
    String proMonthlyPriceId,
    String proAnnualPriceId,
    String starterMonthlyEurPriceId,
    String starterAnnualEurPriceId,
    String proMonthlyEurPriceId,
    String proAnnualEurPriceId,
    String arenaProPriceId
) {}
