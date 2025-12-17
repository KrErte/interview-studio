package ee.kerrete.ainterview.risk.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RiskFlowSummaryResponse {
    String flowId;
    int riskScore;
    double confidence;
    String riskLevel;
    int answered;
    int total;
    String status;
}

