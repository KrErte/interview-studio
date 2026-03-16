package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;

public record InterviewSimStartRequest(
    @NotBlank String targetRole,
    String interviewType,
    String experienceLevel
) {}
