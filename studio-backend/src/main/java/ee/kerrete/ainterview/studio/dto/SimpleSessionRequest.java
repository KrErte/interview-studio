package ee.kerrete.ainterview.studio.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request for creating a simple mode session (guest, 3 questions).
 */
public record SimpleSessionRequest(
        @NotBlank(message = "Target role is required")
        String targetRole,

        @NotBlank(message = "Experience level is required")
        String experienceLevel,

        @NotBlank(message = "Main challenge is required")
        String mainChallenge
) {}
