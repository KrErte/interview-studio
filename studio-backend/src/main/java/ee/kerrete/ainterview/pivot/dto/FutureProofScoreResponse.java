package ee.kerrete.ainterview.pivot.dto;

import ee.kerrete.ainterview.pivot.entity.PivotFutureProofScore;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class FutureProofScoreResponse {
    Double overallScore;
    Double adaptabilityScore;
    Double skillRelevanceScore;
    Double marketDemandScore;
    Double stabilityScore;
    LocalDateTime computedAt;

    public static FutureProofScoreResponse from(PivotFutureProofScore entity) {
        if (entity == null) {
            return null;
        }
        return FutureProofScoreResponse.builder()
            .overallScore(entity.getOverallScore())
            .adaptabilityScore(entity.getAdaptabilityScore())
            .skillRelevanceScore(entity.getSkillRelevanceScore())
            .marketDemandScore(entity.getMarketDemandScore())
            .stabilityScore(entity.getStabilityScore())
            .computedAt(entity.getComputedAt())
            .build();
    }
}

