package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.CoverLetterRequest;
import ee.kerrete.ainterview.arena.dto.CoverLetterResponse;
import ee.kerrete.ainterview.arena.service.CoverLetterService;
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
@RequestMapping("/api/arena/cover-letter")
@RequiredArgsConstructor
public class CoverLetterController {

    private final CoverLetterService coverLetterService;
    private final AppUserRepository appUserRepository;

    @PostMapping("/generate")
    public CoverLetterResponse generate(
        @Valid @RequestBody CoverLetterRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return coverLetterService.generate(request, user.id());
    }

    private void requireProTier(AuthenticatedUser user) {
        AppUser appUser = appUserRepository.findById(user.id())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!appUser.getEffectiveTier().isAtLeast(UserTier.ARENA_PRO)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pro tier required");
        }
    }
}
