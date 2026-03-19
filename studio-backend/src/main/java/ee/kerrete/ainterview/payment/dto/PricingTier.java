package ee.kerrete.ainterview.payment.dto;

import java.util.List;

public record PricingTier(
    String id,
    String name,
    double price,
    String currency,
    List<String> features,
    boolean current,
    boolean popular,
    boolean subscription,
    String billingInterval,
    Double annualPrice,
    Double annualMonthlyPrice,
    String badge
) {}
