package ee.kerrete.ainterview.risk.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class RiskFlowNextRequest {
    /**
     * Primary identifier for the flow/session.
     */
    private UUID flowId;

    /**
     * Alias for flowId to support existing FE naming.
     */
    private UUID sessionId;
}

