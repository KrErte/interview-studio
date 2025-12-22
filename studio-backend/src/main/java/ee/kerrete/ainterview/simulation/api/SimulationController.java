package ee.kerrete.ainterview.simulation.api;

import ee.kerrete.ainterview.simulation.dto.SimulateAiCapabilityRequest;
import ee.kerrete.ainterview.simulation.dto.SimulateSkillRequest;
import ee.kerrete.ainterview.simulation.dto.SimulationOptionsResponse;
import ee.kerrete.ainterview.simulation.dto.SimulationResponse;
import ee.kerrete.ainterview.simulation.service.SimulationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for What-If Simulator feature.
 * Allows users to simulate how skills and AI capabilities affect their exposure score.
 */
@RestController
@RequestMapping("/api/simulate")
@RequiredArgsConstructor
@Slf4j
public class SimulationController {

    private final SimulationService simulationService;

    /**
     * Simulate how learning a new skill affects exposure score.
     * Skills reduce exposure for certain task types.
     *
     * POST /api/simulate/skill
     */
    @PostMapping("/skill")
    public ResponseEntity<SimulationResponse> simulateSkill(
            @Valid @RequestBody SimulateSkillRequest request) {
        log.debug("Simulate skill request: sessionId={}, skillId={}",
                request.getSessionId(), request.getSkillId());

        SimulationResponse response = simulationService.simulateSkill(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Simulate how AI capability advancement affects exposure score.
     * AI capabilities increase exposure for certain task types.
     *
     * POST /api/simulate/ai-capability
     */
    @PostMapping("/ai-capability")
    public ResponseEntity<SimulationResponse> simulateAiCapability(
            @Valid @RequestBody SimulateAiCapabilityRequest request) {
        log.debug("Simulate AI capability request: sessionId={}, capabilityId={}",
                request.getSessionId(), request.getCapabilityId());

        SimulationResponse response = simulationService.simulateAiCapability(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get available simulation options (skills and AI capabilities).
     *
     * GET /api/simulate/options
     */
    @GetMapping("/options")
    public ResponseEntity<SimulationOptionsResponse> getOptions() {
        log.debug("Get simulation options request");

        SimulationOptionsResponse response = simulationService.getOptions();
        return ResponseEntity.ok(response);
    }
}
