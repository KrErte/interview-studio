package ee.kerrete.ainterview.studio.dto;

import java.util.List;

/**
 * Response containing session details and assessment results.
 */
public record SessionResponse(
        Long id,
        String shareId,
        String mode,
        String targetRole,
        String status,
        List<String> blockers,
        String teaserAction,
        boolean paid,
        List<PlanAction> plan,
        List<String> cvRewriteBullets,
        List<String> rolesToAvoid,
        String pivotSuggestion,
        String createdAt
) {}
