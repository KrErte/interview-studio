package ee.kerrete.ainterview.dto;

import lombok.Data;

@Data
public class PracticeAnswerRequest {
    private String sessionId;
    private String questionId;
    private String questionText;
    private String answer;
    private String blocker;
    private String targetRole;
}
