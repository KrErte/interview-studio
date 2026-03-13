package ee.kerrete.ainterview.pivot.dto;

import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import lombok.Data;

@Data
public class CandidateSearchRequest {
    private String targetRole;
    private Double minCareerRiskScore;
    private String location;
    private VisibilityLevel visibility;
}

