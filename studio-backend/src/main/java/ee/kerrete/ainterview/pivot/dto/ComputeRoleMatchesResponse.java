package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.stream.Collectors;

@Value
@Builder
public class ComputeRoleMatchesResponse {
    List<PivotRoleMatchDto> matches;
    CareerRiskScoreResponse careerRiskScore;

    public static ComputeRoleMatchesResponse from(List<? extends PivotRoleMatchDto> matches,
                                                  CareerRiskScoreResponse scoreResponse) {
        return ComputeRoleMatchesResponse.builder()
            .matches(matches.stream().collect(Collectors.toList()))
            .careerRiskScore(scoreResponse)
            .build();
    }
}

