package ee.kerrete.ainterview.studio.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request to mark a session as paid.
 */
public record PaymentRequest(
        @NotNull(message = "Session ID is required")
        Long sessionId,

        String paymentIntentId
) {}
