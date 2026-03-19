package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;

public record CareerMentorStartRequest(
    @NotBlank String targetRole,
    String currentStatus,
    String experienceLevel,
    String mainChallenge
) {}
