package ee.kerrete.ainterview.email;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssessmentEmailData {
    private String role;
    private int riskPercent;
    private int confidence;
    private String assessmentUrl;
}
