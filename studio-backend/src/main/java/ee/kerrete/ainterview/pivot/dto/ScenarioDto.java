package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ScenarioDto {
    String id;
    String action;
    String timeInvestment;
    int riskChange;
    int salaryChange;
    int demandChange;
    String description;
}
