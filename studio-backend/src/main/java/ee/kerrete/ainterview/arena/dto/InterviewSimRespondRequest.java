package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InterviewSimRespondRequest(
    @NotNull Long sessionId,
    @NotBlank String answer
) {}
