package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;

public record CoverLetterRequest(
    @NotBlank String jobDescription,
    String keyExperience,
    String tone
) {}
