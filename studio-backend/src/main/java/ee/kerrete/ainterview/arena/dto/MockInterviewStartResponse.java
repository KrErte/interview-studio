package ee.kerrete.ainterview.arena.dto;

public record MockInterviewStartResponse(
        Long arenaSessionId,
        String question,
        int questionNumber,
        int totalQuestions,
        String targetedBlocker,
        String role,
        String status
) {}
