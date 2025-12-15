package ee.kerrete.ainterview.pivot.dto;

import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CandidateSearchResult {
    Long profileId;
    String displayName;
    String headline;
    String targetRole;
    VisibilityLevel visibility;
    Double matchScore;
    Double futureProofScore;
    String locationPreference;
    boolean openToInterview;
}

