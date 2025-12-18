package ee.kerrete.ainterview.risk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class AnalyzeRequest {
    private String roleTitle;
    private int tenureYears;
    private String contextText;
    private String cvText;
    @JsonAlias("sessionUuid")
    private String sessionId;
}
