package ee.kerrete.ainterview.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for user login.
 */
public record LoginRequest(
    @NotBlank(message = "Email is required")
    String email,

    @NotBlank(message = "Password is required")
    String password
) {}
