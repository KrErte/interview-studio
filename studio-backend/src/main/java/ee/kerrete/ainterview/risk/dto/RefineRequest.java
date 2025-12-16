package ee.kerrete.ainterview.risk.dto;

import lombok.Data;
import java.util.List;

@Data
public class RefineRequest {
    private String analysisId;
    private List<Answer> answers;

    @Data
    public static class Answer {
        private String id;
        private String answer;
    }
}
