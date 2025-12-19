package ee.kerrete.ainterview.risk.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class RiskAssessmentResponse {
    UUID sessionId;
    int riskPercent;
    String riskBand;
    double confidence;
    String roadmapPrecision;
    List<AssessmentWeakness> weaknesses;
    List<RiskSignal> signals;

    @Value
    @Builder
    public static class AssessmentWeakness {
        String title;
        String description;
        String severity;
    }

    @Value
    @Builder
    public static class RiskSignal {
        String key;
        String label;
        int score;
        Double confidence;
        String level;
        String description;
    }
}

