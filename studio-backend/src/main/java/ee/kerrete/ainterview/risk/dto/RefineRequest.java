package ee.kerrete.ainterview.risk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import java.util.List;

@Data
public class RefineRequest {
    private String analysisId;
    private List<Answer> answers;
    @JsonAlias("sessionUuid")
    private String sessionId;

    @Data
    public static class Answer {
        private String id;
        private String answer;
    }
}
