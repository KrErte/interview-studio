package ee.kerrete.ainterview.risk.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RiskFlowAnswerResponse {
    String flowId;
    String questionId;
    String status;
    String receivedAt;
}

