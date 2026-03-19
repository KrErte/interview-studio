package ee.kerrete.ainterview.payment.dto;

import java.util.List;

public record PricingTier(
    String id,
    String name,
    int price,
    String currency,
    List<String> features,
    boolean current,
    boolean popular,
    boolean subscription,
    String billingInterval,
    Integer annualPrice,
    Double annualMonthlyPrice,
    String badge
) {}
