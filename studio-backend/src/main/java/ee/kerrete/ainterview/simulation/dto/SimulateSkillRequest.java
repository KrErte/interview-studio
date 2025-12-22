package ee.kerrete.ainterview.simulation.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request for simulating skill impact on exposure score.
 */
@Data
public class SimulateSkillRequest {
    @NotBlank(message = "sessionId is required")
    @JsonAlias("sessionUuid")
    private String sessionId;

    @NotBlank(message = "skillId is required")
    private String skillId;
}
