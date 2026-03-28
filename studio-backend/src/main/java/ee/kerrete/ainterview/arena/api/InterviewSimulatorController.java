package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.InterviewSimRespondRequest;
import ee.kerrete.ainterview.arena.dto.InterviewSimResponse;
import ee.kerrete.ainterview.arena.dto.InterviewSimStartRequest;
import ee.kerrete.ainterview.arena.service.InterviewSimulatorService;
import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.model.UserTier;
import ee.kerrete.ainterview.repository.AppUserRepository;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/arena/interview-sim")
@RequiredArgsConstructor
public class InterviewSimulatorController {

    private final InterviewSimulatorService interviewSimService;
    private final AppUserRepository appUserRepository;

    @PostMapping("/start")
    public InterviewSimResponse start(
        @Valid @RequestBody InterviewSimStartRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return interviewSimService.startSession(request, user.id());
    }

    @PostMapping("/respond")
    public InterviewSimResponse respond(
        @Valid @RequestBody InterviewSimRespondRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return interviewSimService.respond(request, user.id());
    }

    @PostMapping("/end/{sessionId}")
    public InterviewSimResponse end(
        @PathVariable Long sessionId,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return interviewSimService.endSession(sessionId, user.id());
    }

    @PostMapping("/roadmap")
    public InterviewRoadmapResponse generateRoadmap(
        @RequestBody InterviewRoadmapRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return interviewSimService.generateRoadmap(request);
    }

    @PostMapping("/learn")
    public LearnResourcesResponse generateLearnResources(
        @RequestBody LearnResourcesRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return interviewSimService.generateLearnResources(request);
    }

    public record InterviewRoadmapRequest(
        String targetRole,
        List<String> weaknesses,
        String improvementPlan
    ) {}

    public record InterviewRoadmapResponse(
        List<RoadmapWeek> weeks,
        String summary
    ) {}

    public record RoadmapWeek(
        int week,
        String theme,
        List<String> tasks,
        String milestone
    ) {}

    public record LearnResourcesRequest(
        String targetRole,
        String theme,
        List<String> tasks
    ) {}

    public record LearnResourcesResponse(
        List<LearnResource> resources
    ) {}

    public record LearnResource(
        String title,
        String type,
        String url,
        String description,
        String difficulty
    ) {}

    private void requireProTier(AuthenticatedUser user) {
        AppUser appUser = appUserRepository.findById(user.id())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!appUser.getEffectiveTier().isAtLeast(UserTier.ARENA_PRO)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pro tier required");
        }
    }
}
