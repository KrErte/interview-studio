package ee.kerrete.ainterview.risk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssessmentSubmitAnswerRequest {

    @NotBlank
    private String sessionId;

    @NotBlank
    private String questionId;

    private String answer;
}

