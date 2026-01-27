package ee.kerrete.ainterview.studio.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request for creating an advanced mode session (authenticated, 5 questions + CV).
 */
public record AdvancedSessionRequest(
        @NotBlank(message = "Target role is required")
        String targetRole,

        @NotBlank(message = "Last worked in role is required")
        String lastWorkedInRole,

        @NotBlank(message = "Urgency is required")
        String urgency,

        String recentWorkExamples,

        @NotBlank(message = "Main blocker is required")
        String mainBlocker,

        String cvText
) {}
