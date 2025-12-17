package ee.kerrete.ainterview.risk.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class RiskFlowAnswerRequest {
    private UUID flowId;
    private UUID sessionId;
    private String questionId;
    private String answer;
}

