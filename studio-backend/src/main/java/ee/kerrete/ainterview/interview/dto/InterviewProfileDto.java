package ee.kerrete.ainterview.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewProfileDto {
    private String sessionUuid;
    private String cvFilename;
    private String uploadedAt;

    private List<String> candidateKeySkills;
    private List<String> candidateExperienceDepth;
    private List<String> candidateRealExamples;

    private List<String> interviewerSummary;
    private List<String> interviewerProbePriorities;
    private List<String> interviewerRiskHypotheses;
    private List<String> interviewerClaimsVsDemonstrated;

    private List<ClaimedSkill> claimedSkills;
    private Integer experienceYearsEstimate;
    private String roleFocus;
    private List<String> strengthHypotheses;
    private List<String> riskHypotheses;
    private List<String> probePriorities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClaimedSkill {
        private String name;
        private String confidenceHint;
    }
}



