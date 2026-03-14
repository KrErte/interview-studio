package ee.kerrete.ainterview.payment.dto;

public record TierResponse(
    String tier,
    String purchasedAt,
    boolean hasActiveSubscription,
    String subscriptionStatus,
    String subscriptionEndsAt
) {}
