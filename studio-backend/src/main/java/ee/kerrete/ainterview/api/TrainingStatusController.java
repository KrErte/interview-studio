package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.auth.util.SecurityUtils;
import ee.kerrete.ainterview.dto.TrainingStatusResponse;
import ee.kerrete.ainterview.service.TrainingStatusService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/training")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TrainingStatusController {

    private final TrainingStatusService trainingStatusService;

    @GetMapping("/status")
    public TrainingStatusResponse getStatus() {
        String email = currentUserEmail();
        return trainingStatusService.getStatus(email);
    }

    @PostMapping("/complete/{taskKey}")
    public TrainingStatusResponse setCompleted(@PathVariable("taskKey") String taskKey,
                                               @RequestBody(required = false) TaskCompletionRequest request) {
        String email = currentUserEmail();
        boolean completed = request != null && Boolean.TRUE.equals(request.getCompleted());
        return trainingStatusService.setTaskCompleted(email, taskKey, completed);
    }

    private String currentUserEmail() {
        return SecurityUtils.getEmailFromSecurityContext()
                .filter(StringUtils::hasText)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    @Getter
    @Setter
    public static class TaskCompletionRequest {
        private Boolean completed;
    }
}

