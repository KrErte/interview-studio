package ee.kerrete.ainterview.simulation.service;

import ee.kerrete.ainterview.simulation.config.AiCapabilityImpactRule;
import ee.kerrete.ainterview.simulation.config.SkillImpactRule;
import ee.kerrete.ainterview.simulation.dto.SimulateAiCapabilityRequest;
import ee.kerrete.ainterview.simulation.dto.SimulateSkillRequest;
import ee.kerrete.ainterview.simulation.dto.SimulationOptionsResponse;
import ee.kerrete.ainterview.simulation.dto.SimulationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for simulating impact of skills and AI capabilities on exposure scores.
 * Uses rule-based logic without LLM calls for performance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SimulationService {

    /**
     * In-memory storage for session assessment data.
     * In production, this would read from a database or cache.
     */
    private final Map<String, SessionAssessment> sessionStore = new ConcurrentHashMap<>();

    /**
     * Simulate how learning a new skill affects exposure score.
     * Skills reduce exposure for certain task types.
     */
    public SimulationResponse simulateSkill(SimulateSkillRequest request) {
        log.debug("Simulating skill impact: sessionId={}, skillId={}",
                request.getSessionId(), request.getSkillId());

        SkillImpactRule rule = SkillImpactRule.findById(request.getSkillId());
        if (rule == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown skill: " + request.getSkillId());
        }

        SessionAssessment assessment = getOrCreateAssessment(request.getSessionId());

        List<SimulationResponse.AffectedTask> affectedTasks = new ArrayList<>();
        int totalOriginalWeighted = 0;
        int totalSimulatedWeighted = 0;

        for (TaskExposure task : assessment.tasks) {
            int originalExposure = task.exposurePct;
            int simulatedExposure = originalExposure;

            if (rule.affectsTaskType(task.taskType)) {
                int reduction = rule.calculateReduction(task.taskType);
                simulatedExposure = Math.max(0, originalExposure - reduction);

                affectedTasks.add(SimulationResponse.AffectedTask.builder()
                        .taskId(task.taskId)
                        .taskName(task.taskName)
                        .originalExposure(originalExposure)
                        .simulatedExposure(simulatedExposure)
                        .explanation(rule.generateExplanation(task.taskName))
                        .build());
            }

            totalOriginalWeighted += originalExposure;
            totalSimulatedWeighted += simulatedExposure;
        }

        int taskCount = assessment.tasks.size();
        int originalExposure = taskCount > 0 ? totalOriginalWeighted / taskCount : assessment.overallExposure;
        int simulatedExposure = taskCount > 0 ? totalSimulatedWeighted / taskCount : assessment.overallExposure;

        // If no tasks, use the overall exposure and apply rule average
        if (taskCount == 0) {
            int avgReduction = (rule.getMinReductionPct() + rule.getMaxReductionPct()) / 2;
            simulatedExposure = Math.max(0, originalExposure - avgReduction);
        }

        int delta = simulatedExposure - originalExposure;

        return SimulationResponse.builder()
                .originalExposure(originalExposure)
                .simulatedExposure(simulatedExposure)
                .delta(delta)
                .affectedTasks(affectedTasks)
                .build();
    }

    /**
     * Simulate how AI capability advancement affects exposure score.
     * AI capabilities increase exposure for certain task types.
     */
    public SimulationResponse simulateAiCapability(SimulateAiCapabilityRequest request) {
        log.debug("Simulating AI capability impact: sessionId={}, capabilityId={}",
                request.getSessionId(), request.getCapabilityId());

        AiCapabilityImpactRule rule = AiCapabilityImpactRule.findById(request.getCapabilityId());
        if (rule == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown AI capability: " + request.getCapabilityId());
        }

        SessionAssessment assessment = getOrCreateAssessment(request.getSessionId());

        List<SimulationResponse.AffectedTask> affectedTasks = new ArrayList<>();
        int totalOriginalWeighted = 0;
        int totalSimulatedWeighted = 0;

        for (TaskExposure task : assessment.tasks) {
            int originalExposure = task.exposurePct;
            int simulatedExposure = originalExposure;

            if (rule.affectsTaskType(task.taskType)) {
                int increase = rule.calculateIncrease(task.taskType);
                simulatedExposure = Math.min(100, originalExposure + increase);

                affectedTasks.add(SimulationResponse.AffectedTask.builder()
                        .taskId(task.taskId)
                        .taskName(task.taskName)
                        .originalExposure(originalExposure)
                        .simulatedExposure(simulatedExposure)
                        .explanation(rule.generateExplanation(task.taskName))
                        .build());
            }

            totalOriginalWeighted += originalExposure;
            totalSimulatedWeighted += simulatedExposure;
        }

        int taskCount = assessment.tasks.size();
        int originalExposure = taskCount > 0 ? totalOriginalWeighted / taskCount : assessment.overallExposure;
        int simulatedExposure = taskCount > 0 ? totalSimulatedWeighted / taskCount : assessment.overallExposure;

        // If no tasks, use the overall exposure and apply rule average
        if (taskCount == 0) {
            int avgIncrease = (rule.getMinIncreasePct() + rule.getMaxIncreasePct()) / 2;
            simulatedExposure = Math.min(100, originalExposure + avgIncrease);
        }

        int delta = simulatedExposure - originalExposure;

        return SimulationResponse.builder()
                .originalExposure(originalExposure)
                .simulatedExposure(simulatedExposure)
                .delta(delta)
                .affectedTasks(affectedTasks)
                .build();
    }

    /**
     * Get available simulation options.
     */
    public SimulationOptionsResponse getOptions() {
        List<SimulationOptionsResponse.SkillOption> skills = SkillImpactRule.allSkills().stream()
                .map(rule -> SimulationOptionsResponse.SkillOption.builder()
                        .id(rule.getId())
                        .name(rule.getName())
                        .category(rule.getCategory())
                        .build())
                .toList();

        List<SimulationOptionsResponse.AiCapabilityOption> aiCapabilities =
                AiCapabilityImpactRule.allCapabilities().stream()
                        .map(rule -> SimulationOptionsResponse.AiCapabilityOption.builder()
                                .id(rule.getId())
                                .name(rule.getName())
                                .impactLevel(rule.getImpactLevel())
                                .build())
                        .toList();

        return SimulationOptionsResponse.builder()
                .skills(skills)
                .aiCapabilities(aiCapabilities)
                .build();
    }

    /**
     * Store assessment data for a session (called after risk analysis).
     */
    public void storeAssessment(String sessionId, int overallExposure, List<TaskExposure> tasks) {
        SessionAssessment assessment = new SessionAssessment();
        assessment.sessionId = sessionId;
        assessment.overallExposure = overallExposure;
        assessment.tasks = tasks != null ? new ArrayList<>(tasks) : new ArrayList<>();
        sessionStore.put(sessionId, assessment);
        log.debug("Stored assessment for session: {}", sessionId);
    }

    /**
     * Get or create a mock assessment for the session.
     * In production, this would fetch from database.
     */
    private SessionAssessment getOrCreateAssessment(String sessionId) {
        return sessionStore.computeIfAbsent(sessionId, id -> {
            log.debug("Creating mock assessment for session: {}", id);
            return createMockAssessment(id);
        });
    }

    /**
     * Create a mock assessment with typical tasks for demonstration.
     * In production, this would be populated from actual risk analysis.
     */
    private SessionAssessment createMockAssessment(String sessionId) {
        SessionAssessment assessment = new SessionAssessment();
        assessment.sessionId = sessionId;
        assessment.overallExposure = 47;
        assessment.tasks = List.of(
            new TaskExposure(UUID.randomUUID().toString(), "Data validation", "data-processing", 72),
            new TaskExposure(UUID.randomUUID().toString(), "Report generation", "reporting", 68),
            new TaskExposure(UUID.randomUUID().toString(), "Code review", "coding", 55),
            new TaskExposure(UUID.randomUUID().toString(), "Client communication", "communication", 25),
            new TaskExposure(UUID.randomUUID().toString(), "Strategic planning", "planning", 35),
            new TaskExposure(UUID.randomUUID().toString(), "Data entry", "data-entry", 85),
            new TaskExposure(UUID.randomUUID().toString(), "System architecture", "architecture", 30)
        );
        return assessment;
    }

    /**
     * Internal class representing a session's assessment data.
     */
    private static class SessionAssessment {
        String sessionId;
        int overallExposure;
        List<TaskExposure> tasks = new ArrayList<>();
    }

    /**
     * Internal class representing a task's exposure data.
     */
    public static class TaskExposure {
        final String taskId;
        final String taskName;
        final String taskType;
        final int exposurePct;

        public TaskExposure(String taskId, String taskName, String taskType, int exposurePct) {
            this.taskId = taskId;
            this.taskName = taskName;
            this.taskType = taskType;
            this.exposurePct = exposurePct;
        }
    }
}
