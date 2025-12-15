package ee.kerrete.ainterview.career.dto;

import lombok.Data;

import java.util.List;

@Data
public class FutureProofScoreRequest {
    private Long skillProfileId;
    private String email;
    private String roleFamily;
    private Integer yearsExperience;
    private List<String> skills;
}

