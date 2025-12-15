package ee.kerrete.ainterview.pivot.dto;

import ee.kerrete.ainterview.pivot.entity.PivotMarketplaceProfile;
import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Value
@Builder
public class MarketplaceProfileResponse {
    Long id;
    VisibilityLevel visibility;
    String headline;
    String anonymizedLabel;
    String locationPreference;
    BigDecimal targetRate;
    Boolean openToInterview;
    String contactEmail;
    String contactHandle;
    LocalDate availabilityStart;
    String targetRole;
    String preferredLocations;
    LocalDateTime updatedAt;

    public static MarketplaceProfileResponse from(PivotMarketplaceProfile entity) {
        return MarketplaceProfileResponse.builder()
            .id(entity.getId())
            .visibility(entity.getVisibility())
            .headline(entity.getHeadline())
            .anonymizedLabel(entity.getAnonymizedLabel())
            .locationPreference(entity.getLocationPreference())
            .targetRate(entity.getTargetRate())
            .openToInterview(entity.isOpenToInterview())
            .contactEmail(entity.getContactEmail())
            .contactHandle(entity.getContactHandle())
            .availabilityStart(entity.getAvailabilityStart())
            .targetRole(entity.getProfile() != null ? entity.getProfile().getTargetRole() : null)
            .preferredLocations(entity.getProfile() != null ? entity.getProfile().getPreferredLocations() : null)
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}

