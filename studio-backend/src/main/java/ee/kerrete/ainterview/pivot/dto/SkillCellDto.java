package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SkillCellDto {
    String skill;
    int currentLevel;
    int aiCapability;
    String demandTrend; // rising, stable, declining
    String category;
}
