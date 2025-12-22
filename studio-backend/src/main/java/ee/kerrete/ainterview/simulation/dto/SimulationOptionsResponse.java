package ee.kerrete.ainterview.simulation.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response containing available simulation options.
 */
@Data
@Builder
public class SimulationOptionsResponse {
    private List<SkillOption> skills;
    private List<AiCapabilityOption> aiCapabilities;

    @Data
    @Builder
    public static class SkillOption {
        private String id;
        private String name;
        private String category;
    }

    @Data
    @Builder
    public static class AiCapabilityOption {
        private String id;
        private String name;
        private String impactLevel;
    }
}
