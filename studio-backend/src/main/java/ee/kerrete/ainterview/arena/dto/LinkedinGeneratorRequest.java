package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;

public record LinkedinGeneratorRequest(
    @NotBlank String targetRole,
    String experience,
    String skills,
    String tone
) {}
