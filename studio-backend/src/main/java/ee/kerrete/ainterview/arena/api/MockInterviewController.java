package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.MockInterviewRespondResponse;
import ee.kerrete.ainterview.arena.dto.MockInterviewStartResponse;
import ee.kerrete.ainterview.arena.service.MockInterviewService;
import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.model.CareerSession;
import ee.kerrete.ainterview.model.UserTier;
import ee.kerrete.ainterview.repository.AppUserRepository;
import ee.kerrete.ainterview.repository.CareerSessionRepository;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Mock interview tied to a CareerSession.
 * Access: session must be paid OR user must have STARTER+ subscription.
 */
@RestController
@RequestMapping("/api/sessions/{sessionId}/mock-interview")
@RequiredArgsConstructor
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;
    private final AppUserRepository appUserRepository;
    private final CareerSessionRepository careerSessionRepository;

    @PostMapping("/start")
    public MockInterviewStartResponse start(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireAccess(sessionId, user);
        Long userId = user != null ? user.id() : null;
        return mockInterviewService.start(sessionId, userId);
    }

    @PostMapping("/{arenaSessionId}/respond")
    public MockInterviewRespondResponse respond(
            @PathVariable Long sessionId,
            @PathVariable Long arenaSessionId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireAccess(sessionId, user);
        String answer = body.get("answer");
        if (answer == null || answer.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer is required");
        }
        Long userId = user != null ? user.id() : null;
        return mockInterviewService.respond(arenaSessionId, answer, userId);
    }

    // ─── Access check ─────────────────────────────────────────────────────────
    // Allow access if: the CareerSession is paid  OR the authenticated user has STARTER+

    private void requireAccess(Long sessionId, AuthenticatedUser user) {
        CareerSession session = careerSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        if (session.isPaid()) return;   // session-level payment grants access

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Unlock this session or subscribe to access mock interview");
        }

        AppUser appUser = appUserRepository.findById(user.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!appUser.getEffectiveTier().isAtLeast(UserTier.STARTER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Session must be unlocked or Starter subscription required");
        }
    }
}
