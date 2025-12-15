package ee.kerrete.ainterview.career.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class RoleMatchDto {
    Long roleProfileId;
    String roleName;
    String roleFamily;
    Double overlapPercent;
    List<String> gapSkills;
    Integer estimatedWeeks;
    String source;
}

