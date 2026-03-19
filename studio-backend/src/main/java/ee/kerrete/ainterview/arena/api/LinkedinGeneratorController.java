package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.LinkedinGeneratorRequest;
import ee.kerrete.ainterview.arena.dto.LinkedinGeneratorResponse;
import ee.kerrete.ainterview.arena.service.LinkedinGeneratorService;
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
@RequestMapping("/api/arena/linkedin-generator")
@RequiredArgsConstructor
public class LinkedinGeneratorController {

    private final LinkedinGeneratorService linkedinGeneratorService;
    private final AppUserRepository appUserRepository;

    @PostMapping("/generate")
    public LinkedinGeneratorResponse generate(
        @Valid @RequestBody LinkedinGeneratorRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return linkedinGeneratorService.generate(request, user.id());
    }

    private void requireProTier(AuthenticatedUser user) {
        AppUser appUser = appUserRepository.findById(user.id())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!appUser.getEffectiveTier().isAtLeast(UserTier.ARENA_PRO)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pro tier required");
        }
    }
}
