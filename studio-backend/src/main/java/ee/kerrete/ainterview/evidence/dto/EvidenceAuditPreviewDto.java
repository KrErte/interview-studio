package ee.kerrete.ainterview.evidence.dto;

import java.math.BigDecimal;

/**
 * DTO for silent audit preview.
 * Provides a calm, non-gamified summary of evidence health.
 */
public record EvidenceAuditPreviewDto(
    int evidenceCount,
    BigDecimal exposureScoreCurrent,
    BigDecimal exposureScoreWithoutOldest3,
    BigDecimal delta,
    String message
) {}
