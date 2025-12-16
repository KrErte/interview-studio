package ee.kerrete.ainterview.risk.dto;

import lombok.Data;
import java.util.List;

@Data
public class AnalyzeResponse {
    private String analysisId;
    private String phase;
    private int replaceabilityPct;
    private String riskLabel;
    private String confidence;
    private List<String> strengths;
    private List<String> risks;
    private String whySummary;
    private List<ClarifyingQuestion> clarifyingQuestions;

    @Data
    public static class ClarifyingQuestion {
        private String id;
        private String question;
        private String hint;
    }
}
