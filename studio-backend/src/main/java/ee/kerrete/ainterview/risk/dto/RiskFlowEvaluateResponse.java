package ee.kerrete.ainterview.risk.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RiskFlowEvaluateResponse {
    String flowId;
    String status;
    String evaluatedAt;
    String message;
}

