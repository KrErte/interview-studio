package ee.kerrete.ainterview.studio.dto;

/**
 * Summary of a session for history lists.
 */
public record SessionSummary(
        Long id,
        String shareId,
        String targetRole,
        String status,
        boolean paid,
        String createdAt
) {}
