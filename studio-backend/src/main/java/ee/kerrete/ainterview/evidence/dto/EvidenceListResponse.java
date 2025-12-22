package ee.kerrete.ainterview.evidence.dto;

import java.util.List;

/**
 * Response DTO for listing evidence entries.
 */
public record EvidenceListResponse(
    List<EvidenceEntryDto> entries,
    int totalCount,
    int freshCount,
    int staleCount,
    int oldCount,
    int archiveCount,
    double averageWeight
) {}
