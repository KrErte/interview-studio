package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.CvOptimizerResponse;
import ee.kerrete.ainterview.arena.service.CvOptimizerService;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/arena/cv-optimizer")
@RequiredArgsConstructor
public class CvOptimizerController {

    private final CvOptimizerService cvOptimizerService;

    @PostMapping("/analyze")
    public CvOptimizerResponse analyze(
        @RequestParam("file") MultipartFile cvFile,
        @RequestParam(value = "targetRole", required = false) String targetRole,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return cvOptimizerService.analyze(cvFile, targetRole);
    }
}
