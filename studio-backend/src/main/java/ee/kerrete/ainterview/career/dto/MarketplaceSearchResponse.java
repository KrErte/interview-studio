package ee.kerrete.ainterview.career.dto;

import ee.kerrete.ainterview.career.model.MarketplaceVisibility;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MarketplaceSearchResponse {
    Long marketplaceProfileId;
    Long skillProfileId;
    String email;
    String headline;
    String roleFamily;
    String location;
    Double score;
    Double overlapPercent;
    MarketplaceVisibility visibility;
}

