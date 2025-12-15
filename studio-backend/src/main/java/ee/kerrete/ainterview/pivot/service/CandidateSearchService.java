package ee.kerrete.ainterview.pivot.service;

import ee.kerrete.ainterview.pivot.dto.CandidateSearchRequest;
import ee.kerrete.ainterview.pivot.dto.CandidateSearchResult;
import ee.kerrete.ainterview.pivot.entity.PivotMarketplaceProfile;
import ee.kerrete.ainterview.pivot.entity.PivotRoleMatch;
import ee.kerrete.ainterview.pivot.entity.TransitionProfile;
import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import ee.kerrete.ainterview.pivot.repository.PivotFutureProofScoreRepository;
import ee.kerrete.ainterview.pivot.repository.PivotMarketplaceProfileRepository;
import ee.kerrete.ainterview.pivot.repository.PivotRoleMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateSearchService {

    private final PivotMarketplaceProfileRepository marketplaceProfileRepository;
    private final PivotRoleMatchRepository roleMatchRepository;
    private final PivotFutureProofScoreRepository futureProofScoreRepository;

    @Transactional(readOnly = true)
    public List<CandidateSearchResult> search(CandidateSearchRequest request) {
        VisibilityLevel requested = request.getVisibility();
        List<VisibilityLevel> visibilityFilter;
        if (requested == null || requested == VisibilityLevel.OFF) {
            visibilityFilter = List.of(VisibilityLevel.ANON, VisibilityLevel.PUBLIC);
        } else {
            visibilityFilter = List.of(requested);
        }

        List<PivotMarketplaceProfile> candidates = marketplaceProfileRepository.findByVisibilityIn(visibilityFilter);

        return candidates.stream()
            .filter(profile -> filterByRole(profile.getProfile(), request.getTargetRole()))
            .filter(profile -> filterByLocation(profile, request.getLocation()))
            .map(profile -> toResult(profile, request.getMinFutureProofScore()))
            .flatMap(Optional::stream)
            .sorted(this::compareByScoreDescNullsLast)
            .collect(Collectors.toList());
    }

    private boolean filterByRole(TransitionProfile profile, String requestedRole) {
        if (!StringUtils.hasText(requestedRole)) {
            return true;
        }
        String target = profile.getTargetRole() != null ? profile.getTargetRole().toLowerCase(Locale.ROOT) : "";
        return target.contains(requestedRole.toLowerCase(Locale.ROOT));
    }

    private boolean filterByLocation(PivotMarketplaceProfile profile, String requestedLocation) {
        if (!StringUtils.hasText(requestedLocation)) {
            return true;
        }
        String location = profile.getLocationPreference() != null
            ? profile.getLocationPreference().toLowerCase(Locale.ROOT)
            : "";
        return location.contains(requestedLocation.toLowerCase(Locale.ROOT));
    }

    private Optional<CandidateSearchResult> toResult(PivotMarketplaceProfile profile, Double minFutureScore) {
        TransitionProfile transitionProfile = profile.getProfile();
        PivotRoleMatch lastMatch = roleMatchRepository.findTopByProfileOrderByComputedAtDesc(transitionProfile).orElse(null);
        Double latestFutureProof = futureProofScoreRepository.findTopByProfileOrderByComputedAtDesc(transitionProfile)
            .map(score -> score.getOverallScore())
            .orElse(null);

        if (minFutureScore != null && (latestFutureProof == null || latestFutureProof < minFutureScore)) {
            return Optional.empty();
        }

        String displayName = profile.getVisibility().allowsIdentifiedView()
            ? transitionProfile.getJobseeker().getFullName()
            : defaultAnonLabel(profile);

        CandidateSearchResult result = CandidateSearchResult.builder()
            .profileId(transitionProfile.getId())
            .displayName(displayName)
            .headline(profile.getHeadline())
            .targetRole(transitionProfile.getTargetRole())
            .visibility(profile.getVisibility())
            .matchScore(lastMatch != null ? lastMatch.getMatchScore() : null)
            .futureProofScore(latestFutureProof)
            .locationPreference(profile.getLocationPreference())
            .openToInterview(profile.isOpenToInterview())
            .build();

        return Optional.of(result);
    }

    private int compareByScoreDescNullsLast(CandidateSearchResult left, CandidateSearchResult right) {
        Double l = left.getFutureProofScore();
        Double r = right.getFutureProofScore();
        if (l == null && r == null) {
            return 0;
        }
        if (l == null) {
            return 1;
        }
        if (r == null) {
            return -1;
        }
        return Double.compare(r, l);
    }

    private String defaultAnonLabel(PivotMarketplaceProfile profile) {
        if (StringUtils.hasText(profile.getAnonymizedLabel())) {
            return profile.getAnonymizedLabel();
        }
        return "Candidate-" + profile.getId();
    }
}

