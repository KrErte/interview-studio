package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SkillDecayDto {
    String skill;
    String halfLife;
    int currentRelevance;
    String lastUpdated;
    String decayRate; // fast, moderate, slow
    String renewalAction;
}
