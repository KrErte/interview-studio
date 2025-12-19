package ee.kerrete.ainterview.risk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

import java.util.Map;

@Data
public class RiskFlowEvaluateRequest {
    private String flowId;

    @JsonAlias({"sessionUuid", "sessionId"})
    private String sessionId;

    private Map<String, Object> payload;
}

