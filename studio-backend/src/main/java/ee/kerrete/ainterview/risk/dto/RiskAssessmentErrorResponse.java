package ee.kerrete.ainterview.risk.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RiskAssessmentErrorResponse {
    String code;
    String message;
    String sessionUuid;
}

