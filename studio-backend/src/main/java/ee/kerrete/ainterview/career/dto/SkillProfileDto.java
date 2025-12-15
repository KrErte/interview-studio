package ee.kerrete.ainterview.career.dto;

import ee.kerrete.ainterview.career.model.MarketplaceVisibility;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class SkillProfileDto {
    Long id;
    String email;
    String roleFamily;
    String location;
    Integer yearsExperience;
    List<String> skills;
    MarketplaceVisibility visibility;
    Double futureProofScore;
}

