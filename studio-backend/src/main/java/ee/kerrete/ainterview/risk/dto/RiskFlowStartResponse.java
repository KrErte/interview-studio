package ee.kerrete.ainterview.risk.dto;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class RiskFlowStartResponse {
    UUID flowId;
    String email;
    String sessionId;
    String startedAt;
    String message;
    String context;
    String status;
    String mode;
}

