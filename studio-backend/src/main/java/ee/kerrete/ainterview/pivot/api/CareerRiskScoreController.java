package ee.kerrete.ainterview.pivot.api;

import ee.kerrete.ainterview.pivot.dto.CareerRiskScoreResponse;
import ee.kerrete.ainterview.pivot.service.PivotCareerRiskScoreService;
import org.springframework.beans.factory.annotation.Qualifier;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import ee.kerrete.ainterview.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/studio/career-risk-score", "/api/career-risk-score"})
@RequiredArgsConstructor
public class CareerRiskScoreController {

    @Qualifier("pivotCareerRiskScoreService")
    private final PivotCareerRiskScoreService careerRiskScoreService;

    @GetMapping
    @PreAuthorize("hasRole('JOBSEEKER')")
    public CareerRiskScoreResponse latest(@CurrentUser AuthenticatedUser user) {
        return careerRiskScoreService.getLatestForUser(user.id());
    }
}

