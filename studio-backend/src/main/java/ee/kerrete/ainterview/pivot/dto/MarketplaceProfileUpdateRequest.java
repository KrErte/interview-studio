package ee.kerrete.ainterview.pivot.dto;

import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MarketplaceProfileUpdateRequest {
    private String headline;
    private String anonymizedLabel;
    private String locationPreference;
    private BigDecimal targetRate;
    private Boolean openToInterview = Boolean.TRUE;
    private String contactEmail;
    private String contactHandle;
    private LocalDate availabilityStart;
    @NotNull
    private VisibilityLevel visibility;
}

