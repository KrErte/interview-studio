package ee.kerrete.ainterview.risk.dto;

import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class RiskFlowEvaluateRequest {
    private UUID flowId;
    private UUID sessionId;
    private Map<String, Object> payload;
}

