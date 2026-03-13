package ee.kerrete.ainterview.taskexposure.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Assessment result DTO.
 * Free tier: status, blockers, teaserAction
 * Paid tier: adds plan, cvRewriteBullets, rolesToAvoid, pivotSuggestion
 */
@Data
@Builder
public class AssessmentResult {
    private String assessmentId;

    // Free result fields
    private Status status;
    private List<String> blockers;
    private String teaserAction;

    // Paid result fields (null until payment)
    private List<PlanAction> plan;
    private List<String> cvRewriteBullets;
    private List<String> rolesToAvoid;
    private String pivotSuggestion;
    private boolean paid;

    public enum Status {
        RED, YELLOW, GREEN
    }

    @Data
    @Builder
    public static class PlanAction {
        private int day;
        private String action;
        private String outcome;
    }
}
