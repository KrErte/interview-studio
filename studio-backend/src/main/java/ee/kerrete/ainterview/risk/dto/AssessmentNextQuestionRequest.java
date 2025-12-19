package ee.kerrete.ainterview.risk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssessmentNextQuestionRequest {

    @NotBlank
    private String sessionId;
}

