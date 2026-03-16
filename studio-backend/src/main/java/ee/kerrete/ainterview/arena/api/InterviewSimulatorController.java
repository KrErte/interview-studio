package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.InterviewSimRespondRequest;
import ee.kerrete.ainterview.arena.dto.InterviewSimResponse;
import ee.kerrete.ainterview.arena.dto.InterviewSimStartRequest;
import ee.kerrete.ainterview.arena.service.InterviewSimulatorService;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/arena/interview-sim")
@RequiredArgsConstructor
public class InterviewSimulatorController {

    private final InterviewSimulatorService interviewSimService;

    @PostMapping("/start")
    public InterviewSimResponse start(
        @Valid @RequestBody InterviewSimStartRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return interviewSimService.startSession(request, user.id());
    }

    @PostMapping("/respond")
    public InterviewSimResponse respond(
        @Valid @RequestBody InterviewSimRespondRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return interviewSimService.respond(request, user.id());
    }

    @PostMapping("/end/{sessionId}")
    public InterviewSimResponse end(
        @PathVariable Long sessionId,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return interviewSimService.endSession(sessionId, user.id());
    }
}
