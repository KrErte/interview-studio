package ee.kerrete.ainterview.simulation.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request for simulating AI capability impact on exposure score.
 */
@Data
public class SimulateAiCapabilityRequest {
    @NotBlank(message = "sessionId is required")
    @JsonAlias("sessionUuid")
    private String sessionId;

    @NotBlank(message = "capabilityId is required")
    private String capabilityId;
}
