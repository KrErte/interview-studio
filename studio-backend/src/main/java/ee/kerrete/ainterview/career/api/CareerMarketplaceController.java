package ee.kerrete.ainterview.career.api;

import ee.kerrete.ainterview.career.dto.*;
import ee.kerrete.ainterview.career.service.CareerRiskScoreService;
import ee.kerrete.ainterview.career.service.MarketplaceService;
import ee.kerrete.ainterview.career.service.RoleMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/candidate/marketplace", "/api/marketplace"})
@RequiredArgsConstructor
public class CareerMarketplaceController {

    private final RoleMatchService roleMatchService;
    @Qualifier("careerRiskScoreService")
    private final CareerRiskScoreService careerRiskScoreService;
    private final MarketplaceService marketplaceService;

    @PostMapping("/role-matches")
    public List<RoleMatchDto> computeRoleMatches(@RequestBody RoleMatchRequest request) {
        return roleMatchService.compute(request);
    }

    @PostMapping("/career-risk-score")
    public CareerRiskScoreDto computeCareerRisk(@RequestBody CareerRiskScoreRequest request) {
        return careerRiskScoreService.computeAndPersist(request);
    }

    @GetMapping("/search")
    public List<MarketplaceSearchResponse> search(@RequestParam(value = "roleFamily", required = false) String roleFamily,
                                                  @RequestParam(value = "minOverlap", required = false) Double minOverlap,
                                                  @RequestParam(value = "minScore", required = false) Double minScore,
                                                  @RequestParam(value = "location", required = false) String location) {
        return marketplaceService.search(roleFamily, minOverlap, minScore, location);
    }
}

