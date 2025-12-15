package ee.kerrete.ainterview.pivot.api;

import ee.kerrete.ainterview.pivot.dto.CandidateSearchRequest;
import ee.kerrete.ainterview.pivot.dto.CandidateSearchResult;
import ee.kerrete.ainterview.pivot.dto.MarketplaceProfileResponse;
import ee.kerrete.ainterview.pivot.dto.MarketplaceProfileUpdateRequest;
import ee.kerrete.ainterview.pivot.service.CandidateSearchService;
import ee.kerrete.ainterview.pivot.service.MarketplaceProfileService;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import ee.kerrete.ainterview.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/studio/marketplace", "/api/marketplace"})
@Validated
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceProfileService marketplaceProfileService;
    private final CandidateSearchService candidateSearchService;

    @PutMapping("/profile")
    @PreAuthorize("hasRole('JOBSEEKER')")
    public MarketplaceProfileResponse upsertProfile(@Valid @RequestBody MarketplaceProfileUpdateRequest request,
                                                    @CurrentUser AuthenticatedUser user) {
        return marketplaceProfileService.upsert(user.id(), request);
    }

    @GetMapping("/candidates/search")
    @PreAuthorize("hasAnyRole('INTERVIEWER','ORG_ADMIN')")
    public List<CandidateSearchResult> searchCandidates(@ModelAttribute CandidateSearchRequest request) {
        return candidateSearchService.search(request);
    }
}

