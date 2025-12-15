package ee.kerrete.ainterview.pivot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ComputeRoleMatchesRequest {

    @NotBlank
    private String currentRole;

    @NotEmpty
    private List<@NotBlank String> targetRoles;

    private String jobDescription;

    /**
     * Optional raw skills payload coming from the jobseeker app; stored as JSON for traceability.
     */
    private String skillsJson;

    private String preferredLocations;

    private Integer experienceYears;
}

