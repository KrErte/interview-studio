package ee.kerrete.ainterview.risk.dto;

import jakarta.validation.Valid;
import lombok.Data;

@Data
public class AssessmentStartRequest {

    private String cvFileId;

    @Valid
    private ExperienceInput experience;

    private String depth;
    private String persona;
    private Boolean includeRoadmap;

    @Data
    public static class ExperienceInput {
        private Integer yearsOfExperience;
        private String currentRole;
        private String seniority;
        private String industry;
        private String stack;
        private String country;
    }
}

