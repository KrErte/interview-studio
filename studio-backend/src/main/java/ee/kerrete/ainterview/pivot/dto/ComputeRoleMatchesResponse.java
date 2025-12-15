package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.stream.Collectors;

@Value
@Builder
public class ComputeRoleMatchesResponse {
    List<PivotRoleMatchDto> matches;
    FutureProofScoreResponse futureProofScore;

    public static ComputeRoleMatchesResponse from(List<? extends PivotRoleMatchDto> matches,
                                                  FutureProofScoreResponse scoreResponse) {
        return ComputeRoleMatchesResponse.builder()
            .matches(matches.stream().collect(Collectors.toList()))
            .futureProofScore(scoreResponse)
            .build();
    }
}

