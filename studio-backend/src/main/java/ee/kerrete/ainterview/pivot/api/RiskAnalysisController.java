package ee.kerrete.ainterview.pivot.api;

import ee.kerrete.ainterview.pivot.dto.*;
import ee.kerrete.ainterview.pivot.service.RiskAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/studio/risk-analysis", "/api/risk-analysis"})
@RequiredArgsConstructor
public class RiskAnalysisController {

    private final RiskAnalysisService riskAnalysisService;

    /**
     * Get complete risk analysis for a session
     */
    @GetMapping("/{sessionId}")
    public RiskAnalysisResponse getFullAnalysis(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "Software Engineer") String role) {
        return riskAnalysisService.getAnalysisForSession(sessionId, role);
    }

    /**
     * Get threat vectors for a session
     */
    @GetMapping("/{sessionId}/threats")
    public List<ThreatVectorDto> getThreatVectors(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "Software Engineer") String role) {
        return riskAnalysisService.getThreatVectors(sessionId, role);
    }

    /**
     * Get skill vulnerability matrix
     */
    @GetMapping("/{sessionId}/skills")
    public List<SkillCellDto> getSkillMatrix(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "Software Engineer") String role) {
        return riskAnalysisService.getSkillMatrix(sessionId, role);
    }

    /**
     * Get career vital signs
     */
    @GetMapping("/{sessionId}/vitals")
    public List<VitalSignDto> getVitalSigns(@PathVariable String sessionId) {
        return riskAnalysisService.getVitalSigns(sessionId);
    }

    /**
     * Get AI encroachment timeline
     */
    @GetMapping("/{sessionId}/ai-timeline")
    public List<AIMilestoneDto> getAIMilestones(@PathVariable String sessionId) {
        return riskAnalysisService.getAIMilestones(sessionId);
    }

    /**
     * Get what-if scenarios
     */
    @GetMapping("/{sessionId}/scenarios")
    public List<ScenarioDto> getScenarios(@PathVariable String sessionId) {
        return riskAnalysisService.getScenarios(sessionId);
    }

    /**
     * Get skill decay information
     */
    @GetMapping("/{sessionId}/skill-decay")
    public List<SkillDecayDto> getSkillDecay(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "Software Engineer") String role) {
        return riskAnalysisService.getSkillDecay(sessionId, role);
    }

    /**
     * Get market signals
     */
    @GetMapping("/{sessionId}/market-signals")
    public List<MarketSignalDto> getMarketSignals(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "Software Engineer") String role) {
        return riskAnalysisService.getMarketSignals(sessionId, role);
    }

    /**
     * Get market metrics
     */
    @GetMapping("/{sessionId}/market-metrics")
    public List<MarketMetricDto> getMarketMetrics(@PathVariable String sessionId) {
        return riskAnalysisService.getMarketMetrics(sessionId);
    }

    /**
     * Get disrupted role case studies
     */
    @GetMapping("/{sessionId}/disrupted-roles")
    public List<DisruptedRoleDto> getDisruptedRoles(@PathVariable String sessionId) {
        return riskAnalysisService.getDisruptedRoles(sessionId);
    }
}
