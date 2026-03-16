package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.JobXrayRequest;
import ee.kerrete.ainterview.arena.dto.JobXrayResponse;
import ee.kerrete.ainterview.arena.service.JobXrayService;
import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.model.UserTier;
import ee.kerrete.ainterview.repository.AppUserRepository;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/arena/job-xray")
@RequiredArgsConstructor
public class JobXrayController {

    private final JobXrayService jobXrayService;
    private final AppUserRepository appUserRepository;

    @PostMapping("/analyze")
    public JobXrayResponse analyze(
        @Valid @RequestBody JobXrayRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        Long userId = user != null ? user.id() : null;
        boolean isPro = false;
        if (userId != null) {
            isPro = appUserRepository.findById(userId)
                .map(u -> u.getEffectiveTier() == UserTier.ARENA_PRO)
                .orElse(false);
        }
        return jobXrayService.analyze(request, userId, isPro);
    }
}
