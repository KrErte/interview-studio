package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;

public record SalaryCoachStartRequest(
    @NotBlank String targetRole,
    String currentSalary,
    String offeredSalary,
    String location,
    String experienceYears
) {}
