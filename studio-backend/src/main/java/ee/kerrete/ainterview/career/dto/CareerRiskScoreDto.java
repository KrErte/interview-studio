package ee.kerrete.ainterview.career.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class CareerRiskScoreDto {
    Long skillProfileId;
    Double score;
    String explainJson;
    LocalDateTime computedAt;
}

