package ee.kerrete.ainterview.risk.dto;

import lombok.Data;

@Data
public class AnalyzeRequest {
    private String roleTitle;
    private int tenureYears;
    private String contextText;
    private String cvText;
}
