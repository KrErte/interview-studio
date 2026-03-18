package ee.kerrete.ainterview.arena.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InterviewSimResponse {
    private Long sessionId;
    private String question;
    private String feedback;
    private int questionNumber;
    private int totalQuestions;

    @JsonProperty("isComplete")
    private boolean isComplete;

    private InterviewFeedback finalFeedback;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InterviewFeedback {
        private int overallScore;
        private List<String> strengths;
        private List<String> weaknesses;
        private String verdict;
        private String improvementPlan;
    }
}
