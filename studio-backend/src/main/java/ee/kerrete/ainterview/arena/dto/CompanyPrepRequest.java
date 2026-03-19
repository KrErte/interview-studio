package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyPrepRequest(
    @NotBlank String companyName,
    @NotBlank String targetRole,
    String experienceLevel
) {}
