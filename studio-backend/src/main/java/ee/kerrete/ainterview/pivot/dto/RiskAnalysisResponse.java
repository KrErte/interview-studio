package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

@Value
@Builder
public class RiskAnalysisResponse {
    List<ThreatVectorDto> threatVectors;
    List<SkillCellDto> skillMatrix;
    List<VitalSignDto> vitalSigns;
    List<AIMilestoneDto> aiMilestones;
    List<ScenarioDto> scenarios;
    List<SkillDecayDto> skillDecay;
    List<MarketSignalDto> marketSignals;
    List<MarketMetricDto> marketMetrics;
    List<DisruptedRoleDto> disruptedRoles;
}
