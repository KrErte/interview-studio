package ee.kerrete.ainterview.pivot.dto;

import ee.kerrete.ainterview.pivot.entity.PivotRoleMatch;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class PivotRoleMatchDto {
    Long id;
    String targetRole;
    Double matchScore;
    Double futureProofScore;
    String gapSummary;
    String recommendedActions;
    LocalDateTime computedAt;

    public static PivotRoleMatchDto from(PivotRoleMatch entity) {
        return PivotRoleMatchDto.builder()
            .id(entity.getId())
            .targetRole(entity.getTargetRole())
            .matchScore(entity.getMatchScore())
            .futureProofScore(entity.getFutureProofScore())
            .gapSummary(entity.getGapSummary())
            .recommendedActions(entity.getRecommendedActions())
            .computedAt(entity.getComputedAt())
            .build();
    }
}


