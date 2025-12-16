package ee.kerrete.ainterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingStatusResponse {

    private int totalTasks;
    private int completedTasks;
    private int progressPercent;
    private List<TaskStatus> tasks;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskStatus {
        private String taskKey;
        private boolean completed;
        private LocalDateTime completedAt;
    }
}

