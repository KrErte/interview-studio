package ee.kerrete.ainterview.risk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class RiskFlowNextRequest {
    /**
     * Primary identifier for the flow/session. Accepts UUID string or mock-session-*.
     */
    private String flowId;

    /**
     * Alias for flowId to support existing FE naming.
     */
    @JsonAlias({"sessionUuid", "sessionId"})
    private String sessionId;
}

