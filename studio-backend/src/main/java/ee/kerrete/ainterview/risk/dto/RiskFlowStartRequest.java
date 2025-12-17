package ee.kerrete.ainterview.risk.dto;

import lombok.Data;

@Data
public class RiskFlowStartRequest {

    /**
     * Optional free-form context from client.
     */
    private String context;

    /**
     * Optional flow mode/persona. Defaults to STANDARD.
     */
    private String mode;
}

