package ee.kerrete.ainterview.evidence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new evidence entry.
 */
public record CreateEvidenceRequest(
    @NotBlank(message = "Content is required")
    @Size(min = 5, max = 2000, message = "Content must be between 5 and 2000 characters")
    String content
) {}
