package ee.kerrete.ainterview.pivot.dto;

import ee.kerrete.ainterview.pivot.entity.PivotCareerRiskScore;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class CareerRiskScoreResponse {
    Double overallScore;
    Double adaptabilityScore;
    Double skillRelevanceScore;
    Double marketDemandScore;
    Double stabilityScore;
    LocalDateTime computedAt;

    public static CareerRiskScoreResponse from(PivotCareerRiskScore entity) {
        if (entity == null) {
            return null;
        }
        return CareerRiskScoreResponse.builder()
            .overallScore(entity.getOverallScore())
            .adaptabilityScore(entity.getAdaptabilityScore())
            .skillRelevanceScore(entity.getSkillRelevanceScore())
            .marketDemandScore(entity.getMarketDemandScore())
            .stabilityScore(entity.getStabilityScore())
            .computedAt(entity.getComputedAt())
            .build();
    }
}

