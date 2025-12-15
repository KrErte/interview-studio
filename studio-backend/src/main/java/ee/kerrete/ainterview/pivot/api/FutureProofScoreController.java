package ee.kerrete.ainterview.pivot.api;

import ee.kerrete.ainterview.pivot.dto.FutureProofScoreResponse;
import ee.kerrete.ainterview.pivot.service.PivotFutureProofScoreService;
import org.springframework.beans.factory.annotation.Qualifier;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import ee.kerrete.ainterview.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/studio/future-proof-score", "/api/future-proof-score"})
@RequiredArgsConstructor
public class FutureProofScoreController {

    @Qualifier("pivotFutureProofScoreService")
    private final PivotFutureProofScoreService futureProofScoreService;

    @GetMapping
    @PreAuthorize("hasRole('JOBSEEKER')")
    public FutureProofScoreResponse latest(@CurrentUser AuthenticatedUser user) {
        return futureProofScoreService.getLatestForUser(user.id());
    }
}

