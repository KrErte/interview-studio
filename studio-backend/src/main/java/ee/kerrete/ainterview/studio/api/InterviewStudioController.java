package ee.kerrete.ainterview.studio.api;

import ee.kerrete.ainterview.auth.util.SecurityUtils;
import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.repository.AppUserRepository;
import ee.kerrete.ainterview.studio.dto.*;
import ee.kerrete.ainterview.studio.service.InterviewStudioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Interview Studio V2 REST controller.
 * Supports both guest (simple) and authenticated (advanced) modes.
 */
@RestController
@RequestMapping("/api/studio/v2")
@RequiredArgsConstructor
@Slf4j
public class InterviewStudioController {

    private final InterviewStudioService studioService;
    private final AppUserRepository userRepository;

    /**
     * Create a simple mode session (guest, no auth required).
     * POST /api/studio/v2/sessions/simple
     */
    @PostMapping("/sessions/simple")
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse createSimpleSession(@Valid @RequestBody SimpleSessionRequest request) {
        log.info("Creating simple session for role: {}", request.targetRole());
        return studioService.createSimpleSession(request);
    }

    /**
     * Create an advanced mode session (requires auth).
     * POST /api/studio/v2/sessions/advanced
     */
    @PostMapping("/sessions/advanced")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<SessionResponse> createAdvancedSession(@Valid @RequestBody AdvancedSessionRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("Creating advanced session for role: {}, userId: {}", request.targetRole(), userId);
        SessionResponse response = studioService.createAdvancedSession(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get a session by ID.
     * GET /api/studio/v2/sessions/{id}
     */
    @GetMapping("/sessions/{id}")
    public ResponseEntity<SessionResponse> getSession(@PathVariable Long id) {
        return studioService.getSession(id, false)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get full (paid) session content.
     * GET /api/studio/v2/sessions/{id}/full
     */
    @GetMapping("/sessions/{id}/full")
    public ResponseEntity<SessionResponse> getFullSession(@PathVariable Long id) {
        return studioService.getSession(id, true)
                .map(session -> {
                    if (!session.paid()) {
                        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).<SessionResponse>build();
                    }
                    return ResponseEntity.ok(session);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get a session by share ID (public access).
     * GET /api/studio/v2/share/{shareId}
     */
    @GetMapping("/share/{shareId}")
    public ResponseEntity<SessionResponse> getSharedSession(@PathVariable String shareId) {
        return studioService.getSessionByShareId(shareId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get session history for current user (requires auth).
     * GET /api/studio/v2/sessions/history
     */
    @GetMapping("/sessions/history")
    public ResponseEntity<List<SessionSummary>> getSessionHistory() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<SessionSummary> history = studioService.getSessionHistory(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * Mark a session as paid (stubbed payment processing).
     * POST /api/studio/v2/sessions/pay
     */
    @PostMapping("/sessions/pay")
    public ResponseEntity<SessionResponse> markSessionPaid(@Valid @RequestBody PaymentRequest request) {
        log.info("Processing payment for session: {}", request.sessionId());

        // In production, verify payment with Stripe here
        // For now, just mark as paid
        try {
            SessionResponse response = studioService.markSessionPaid(
                    request.sessionId(),
                    request.paymentIntentId() != null ? request.paymentIntentId() : "stub_" + System.currentTimeMillis()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get current authenticated user's ID.
     */
    private Long getCurrentUserId() {
        return SecurityUtils.getEmailFromSecurityContext()
                .flatMap(email -> userRepository.findByEmailIgnoreCase(email))
                .map(AppUser::getId)
                .orElse(null);
    }
}
