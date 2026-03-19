package ee.kerrete.ainterview.arena.dto;

import java.util.List;

public record MockInterviewRespondResponse(
        Long arenaSessionId,
        boolean isComplete,
        String question,
        int questionNumber,
        int totalQuestions,
        String targetedBlocker,
        String feedback,
        String blockerFeedback,
        MockInterviewSummary summary
) {
    public record MockInterviewSummary(
            int overallScore,
            List<BlockerResolution> blockerResolutions,
            List<String> strengths,
            List<String> weaknesses,
            String verdict,
            String improvementPlan
    ) {}

    public record BlockerResolution(
            String blocker,
            String resolution,  // "ADDRESSED" / "PARTIAL" / "MISSED"
            String note
    ) {}
}
