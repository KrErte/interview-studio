package ee.kerrete.ainterview.pivot.service;

import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.pivot.dto.MarketplaceProfileResponse;
import ee.kerrete.ainterview.pivot.dto.MarketplaceProfileUpdateRequest;
import ee.kerrete.ainterview.pivot.entity.PivotMarketplaceProfile;
import ee.kerrete.ainterview.pivot.entity.TransitionProfile;
import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import ee.kerrete.ainterview.pivot.repository.PivotMarketplaceProfileRepository;
import ee.kerrete.ainterview.pivot.repository.TransitionProfileRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MarketplaceProfileService {

    private final PivotMarketplaceProfileRepository marketplaceProfileRepository;
    private final TransitionProfileRepository transitionProfileRepository;
    private final EntityManager entityManager;

    @Transactional
    public MarketplaceProfileResponse upsert(Long userId, MarketplaceProfileUpdateRequest request) {
        TransitionProfile profile = transitionProfileRepository.findByJobseekerId(userId)
            .orElseGet(() -> TransitionProfile.builder()
                .jobseeker(referenceUser(userId))
                .visibility(request.getVisibility() != null ? request.getVisibility() : VisibilityLevel.ANON)
                .build());

        // visibility propagated to both transition profile and marketplace profile
        if (request.getVisibility() != null) {
            profile.setVisibility(request.getVisibility());
        }
        transitionProfileRepository.save(profile);

        PivotMarketplaceProfile marketplaceProfile = marketplaceProfileRepository.findByProfileId(profile.getId())
            .orElseGet(() -> PivotMarketplaceProfile.builder()
                .profile(profile)
                .visibility(profile.getVisibility())
                .build());

        marketplaceProfile.setHeadline(request.getHeadline());
        marketplaceProfile.setAnonymizedLabel(request.getAnonymizedLabel());
        marketplaceProfile.setLocationPreference(request.getLocationPreference());
        marketplaceProfile.setTargetRate(request.getTargetRate());
        marketplaceProfile.setOpenToInterview(Boolean.TRUE.equals(request.getOpenToInterview()));
        marketplaceProfile.setContactEmail(request.getContactEmail());
        marketplaceProfile.setContactHandle(request.getContactHandle());
        marketplaceProfile.setAvailabilityStart(request.getAvailabilityStart());
        if (request.getVisibility() != null) {
            marketplaceProfile.setVisibility(request.getVisibility());
        }

        PivotMarketplaceProfile saved = marketplaceProfileRepository.save(marketplaceProfile);
        return MarketplaceProfileResponse.from(saved);
    }

    private AppUser referenceUser(Long userId) {
        return entityManager.getReference(AppUser.class, userId);
    }
}

