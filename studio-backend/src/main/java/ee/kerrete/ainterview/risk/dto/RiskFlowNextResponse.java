package ee.kerrete.ainterview.risk.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RiskFlowNextResponse {
    String flowId;
    String questionId;
    String question;
    int index;
    int totalPlanned;
    boolean done;
}

