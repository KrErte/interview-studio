package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;

public record SalaryBenchmarkRequest(
    @NotBlank String targetRole,
    @NotBlank String location,
    String experienceLevel
) {}
