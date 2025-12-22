package ee.kerrete.ainterview.simulation.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response for simulation requests (both skill and AI capability).
 */
@Data
@Builder
public class SimulationResponse {
    private int originalExposure;
    private int simulatedExposure;
    private int delta;
    private List<AffectedTask> affectedTasks;

    @Data
    @Builder
    public static class AffectedTask {
        private String taskId;
        private String taskName;
        private int originalExposure;
        private int simulatedExposure;
        private String explanation;
    }
}
