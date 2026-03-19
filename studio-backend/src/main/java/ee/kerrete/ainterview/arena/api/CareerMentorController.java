package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.CareerMentorStartRequest;
import ee.kerrete.ainterview.arena.dto.CareerMentorMessageRequest;
import ee.kerrete.ainterview.arena.dto.CareerMentorResponse;
import ee.kerrete.ainterview.arena.service.CareerMentorService;
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

@RestController
@RequestMapping("/api/arena/career-mentor")
@RequiredArgsConstructor
public class CareerMentorController {

    private final CareerMentorService careerMentorService;
    private final AppUserRepository appUserRepository;

    @PostMapping("/start")
    public CareerMentorResponse start(
        @Valid @RequestBody CareerMentorStartRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return careerMentorService.startSession(request, user.id());
    }

    @PostMapping("/message")
    public CareerMentorResponse message(
        @Valid @RequestBody CareerMentorMessageRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return careerMentorService.message(request, user.id());
    }

    private void requireProTier(AuthenticatedUser user) {
        AppUser appUser = appUserRepository.findById(user.id())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!appUser.getEffectiveTier().isAtLeast(UserTier.ARENA_PRO)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pro tier required");
        }
    }
}
