package ee.kerrete.ainterview.career.dto;

import lombok.Data;

import java.util.List;

@Data
public class RoleMatchRequest {
    private Long skillProfileId;
    private String email;
    private String targetRoleFamily;
    private List<String> targetRequiredSkills;
    private String location;
    private Double minOverlap;
}

