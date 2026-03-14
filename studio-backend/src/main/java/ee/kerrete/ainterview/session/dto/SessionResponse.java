package ee.kerrete.ainterview.session.dto;

import java.util.List;

public record SessionResponse(
    Long id,
    String shareId,
    String mode,
    String targetRole,
    String status,        // RED, YELLOW, GREEN
    List<String> blockers,
    String teaserAction,
    boolean paid,
    // Paid content (null if not paid)
    List<PlanItem> plan,
    List<String> cvRewriteBullets,
    List<String> rolesToAvoid,
    String pivotSuggestion,
    String createdAt
) {
    public record PlanItem(int week, String title, String description) {}
}
