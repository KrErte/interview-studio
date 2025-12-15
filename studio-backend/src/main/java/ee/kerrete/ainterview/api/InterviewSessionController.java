package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.dto.CreateInterviewSessionRequest;
import ee.kerrete.ainterview.dto.CreateInterviewSessionResponse;
import ee.kerrete.ainterview.interview.service.InterviewSessionPersistenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview-sessions")
@CrossOrigin(origins = "http://localhost:4200")
public class InterviewSessionController {

    private final InterviewSessionPersistenceService sessionService;

    public InterviewSessionController(InterviewSessionPersistenceService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<CreateInterviewSessionResponse> createSession(
            @RequestBody CreateInterviewSessionRequest request
    ) {
        return ResponseEntity.ok(sessionService.createSession(request));
    }
}
