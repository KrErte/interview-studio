package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.SalaryCoachMessageRequest;
import ee.kerrete.ainterview.arena.dto.SalaryCoachResponse;
import ee.kerrete.ainterview.arena.dto.SalaryCoachStartRequest;
import ee.kerrete.ainterview.arena.service.SalaryCoachService;
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
@RequestMapping("/api/arena/salary-coach")
@RequiredArgsConstructor
public class SalaryCoachController {

    private final SalaryCoachService salaryCoachService;
    private final AppUserRepository appUserRepository;

    @PostMapping("/start")
    public SalaryCoachResponse start(
        @Valid @RequestBody SalaryCoachStartRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return salaryCoachService.startSession(request, user.id());
    }

    @PostMapping("/message")
    public SalaryCoachResponse message(
        @Valid @RequestBody SalaryCoachMessageRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return salaryCoachService.message(request, user.id());
    }

    private void requireProTier(AuthenticatedUser user) {
        AppUser appUser = appUserRepository.findById(user.id())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!appUser.getEffectiveTier().isAtLeast(UserTier.ARENA_PRO)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pro tier required");
        }
    }
}
