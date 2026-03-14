package ee.kerrete.ainterview.session.dto;

public record SessionSummary(
    Long id,
    String shareId,
    String mode,
    String targetRole,
    String status,
    boolean paid,
    String createdAt
) {}
