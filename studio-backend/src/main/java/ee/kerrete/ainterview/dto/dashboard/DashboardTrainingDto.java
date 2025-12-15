package ee.kerrete.ainterview.dto.dashboard;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DashboardTrainingDto {
    long totalTasks;
    long completedTasks;
    Integer progressPercent;
    String status;
}

