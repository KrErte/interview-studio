package ee.kerrete.ainterview.arena.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CvOptimizerResponse {
    private int atsScore;
    private List<String> missingKeywords;
    private List<SectionFeedback> sectionFeedback;
    private List<String> impactImprovements;
    private List<String> linkedInTips;
    private String overallSummary;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SectionFeedback {
        private String section;
        private String status;
        private String suggestion;
    }
}
