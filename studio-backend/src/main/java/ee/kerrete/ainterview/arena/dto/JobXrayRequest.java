package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;

public record JobXrayRequest(
    @NotBlank String jobDescription,
    String targetRole
) {}
