package ee.kerrete.ainterview.payment.dto;

import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
    @NotBlank String tier,
    @NotBlank String successUrl,
    @NotBlank String cancelUrl,
    String billingInterval
) {}
