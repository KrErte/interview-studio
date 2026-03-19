package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.CvOptimizerResponse;
import ee.kerrete.ainterview.arena.service.CvOptimizerService;
import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.model.UserTier;
import ee.kerrete.ainterview.repository.AppUserRepository;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/arena/cv-optimizer")
@RequiredArgsConstructor
public class CvOptimizerController {

    private final CvOptimizerService cvOptimizerService;
    private final AppUserRepository appUserRepository;

    @PostMapping("/analyze")
    public CvOptimizerResponse analyze(
        @RequestParam("file") MultipartFile cvFile,
        @RequestParam(value = "targetRole", required = false) String targetRole,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        requireProTier(user);
        return cvOptimizerService.analyze(cvFile, targetRole);
    }

    private void requireProTier(AuthenticatedUser user) {
        AppUser appUser = appUserRepository.findById(user.id())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!appUser.getEffectiveTier().isAtLeast(UserTier.ARENA_PRO)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pro tier required");
        }
    }
}
