package ee.kerrete.ainterview.service;

import ee.kerrete.ainterview.dto.TrainingStatusResponse;
import ee.kerrete.ainterview.model.TrainingTask;
import ee.kerrete.ainterview.repository.TrainingTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class TrainingStatusService {

    private final TrainingTaskRepository trainingTaskRepository;

    @Transactional(readOnly = true)
    public TrainingStatusResponse getStatus(String email) {
        List<TrainingTask> tasks = trainingTaskRepository.findByEmailOrderByCreatedAtDesc(email);

        int total = tasks.size();
        int completed = (int) tasks.stream().filter(TrainingTask::isCompleted).count();
        int percent = total > 0 ? (int) Math.round(completed * 100.0 / total) : 0;

        List<TrainingStatusResponse.TaskStatus> taskStatuses = tasks.stream()
                .map(this::toTaskStatus)
                .collect(Collectors.toList());

        return TrainingStatusResponse.builder()
                .totalTasks(total)
                .completedTasks(completed)
                .progressPercent(percent)
                .tasks(taskStatuses)
                .build();
    }

    @Transactional
    public TrainingStatusResponse setTaskCompleted(String email, String taskKey, boolean completed) {
        if (!StringUtils.hasText(taskKey)) {
            throw new ResponseStatusException(BAD_REQUEST, "taskKey is required");
        }

        LocalDateTime now = LocalDateTime.now();
        TrainingTask task = trainingTaskRepository.findByEmailAndTaskKey(email, taskKey)
                .orElseGet(() -> TrainingTask.builder()
                        .email(email)
                        .taskKey(taskKey)
                        .createdAt(now)
                        .build());

        task.setCompleted(completed);
        task.setUpdatedAt(now);

        trainingTaskRepository.save(task);
        return getStatus(email);
    }

    private TrainingStatusResponse.TaskStatus toTaskStatus(TrainingTask task) {
        LocalDateTime completedAt = task.isCompleted()
                ? (task.getUpdatedAt() != null ? task.getUpdatedAt() : task.getCreatedAt())
                : null;

        String key = StringUtils.hasText(task.getTaskKey())
                ? task.getTaskKey()
                : fallbackKey(task);

        return TrainingStatusResponse.TaskStatus.builder()
                .taskKey(key)
                .completed(task.isCompleted())
                .completedAt(completedAt)
                .build();
    }

    private String fallbackKey(TrainingTask task) {
        if (task.getId() != null) {
            return "task-" + task.getId();
        }
        return "task-" + System.identityHashCode(task);
    }
}

