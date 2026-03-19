package ee.kerrete.ainterview.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.stripe")
public record StripeProperties(
    String secretKey,
    String publishableKey,
    String webhookSecret,
    String arenaProPriceId,
    String starterMonthlyPriceId,
    String starterAnnualPriceId,
    String proMonthlyPriceId,
    String proAnnualPriceId
) {}
