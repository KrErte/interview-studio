package ee.kerrete.ainterview.arena.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CareerMentorMessageRequest(
    @NotNull Long sessionId,
    @NotBlank String message
) {}
