package ee.kerrete.ainterview.evidence.dto;

import ee.kerrete.ainterview.evidence.model.EvidenceStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for evidence entry with computed decay fields.
 */
@Builder
public record EvidenceEntryDto(
    UUID id,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime lastAnchoredAt,
    int anchorCount,
    String detectedCategory,
    List<String> extractedVerbs,
    List<String> extractedEntities,
    // Computed fields
    long ageDays,
    double weight,
    EvidenceStatus status,
    boolean needsReanchor
) {}
