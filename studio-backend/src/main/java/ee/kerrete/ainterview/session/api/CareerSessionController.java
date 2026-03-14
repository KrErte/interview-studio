package ee.kerrete.ainterview.session.api;

import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.session.dto.CreateSessionRequest;
import ee.kerrete.ainterview.session.dto.SessionResponse;
import ee.kerrete.ainterview.session.dto.SessionSummary;
import ee.kerrete.ainterview.session.service.CareerSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class CareerSessionController {

    private final CareerSessionService service;

    @PostMapping
    public ResponseEntity<SessionResponse> create(
            @RequestBody CreateSessionRequest request,
            Authentication auth) {
        Long userId = extractUserId(auth);
        SessionResponse response = service.createSession(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public SessionResponse getSession(@PathVariable Long id) {
        return service.getSession(id);
    }

    @GetMapping("/history")
    public List<SessionSummary> getHistory(Authentication auth) {
        Long userId = extractUserId(auth);
        if (userId == null) {
            return List.of();
        }
        return service.getUserSessions(userId);
    }

    @GetMapping("/share/{shareId}")
    public SessionResponse getShared(@PathVariable String shareId) {
        return service.getByShareId(shareId);
    }

    private Long extractUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof AppUser user) {
            return user.getId();
        }
        return null;
    }
}
