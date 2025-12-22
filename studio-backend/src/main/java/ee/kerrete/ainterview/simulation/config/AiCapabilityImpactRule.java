package ee.kerrete.ainterview.simulation.config;

import lombok.Getter;

import java.util.List;
import java.util.Set;

/**
 * Rule-based configuration for how AI capabilities impact task exposure.
 * Each AI capability increases exposure for certain task types.
 */
@Getter
public enum AiCapabilityImpactRule {
    CODE_GEN_V2(
        "code-gen-v2",
        "Advanced Code Generation",
        "high",
        Set.of("coding", "debugging", "implementation", "scripting", "programming", "development"),
        15, 25,
        "Advanced code generation can handle more complex %s tasks autonomously"
    ),
    REASONING_V2(
        "reasoning-v2",
        "Complex Reasoning",
        "high",
        Set.of("analysis", "planning", "strategy", "problem-solving", "decision-making"),
        10, 20,
        "Enhanced reasoning allows AI to tackle %s with less human oversight"
    ),
    MULTIMODAL_V2(
        "multimodal-v2",
        "Multimodal Understanding",
        "medium",
        Set.of("visual", "design", "documentation", "presentation", "content-review"),
        8, 15,
        "Multimodal AI can process %s across text, images, and video"
    ),
    AGENTIC_V1(
        "agentic-v1",
        "Autonomous Agents",
        "extreme",
        Set.of("*"), // Affects all task types
        20, 40,
        "Autonomous agents can chain multiple %s steps without human intervention"
    );

    private final String id;
    private final String name;
    private final String impactLevel;
    private final Set<String> affectedTaskTypes;
    private final int minIncreasePct;
    private final int maxIncreasePct;
    private final String explanationTemplate;

    AiCapabilityImpactRule(String id, String name, String impactLevel, Set<String> affectedTaskTypes,
                           int minIncreasePct, int maxIncreasePct, String explanationTemplate) {
        this.id = id;
        this.name = name;
        this.impactLevel = impactLevel;
        this.affectedTaskTypes = affectedTaskTypes;
        this.minIncreasePct = minIncreasePct;
        this.maxIncreasePct = maxIncreasePct;
        this.explanationTemplate = explanationTemplate;
    }

    /**
     * Check if this AI capability affects the given task type.
     * Wildcard "*" means it affects all task types.
     */
    public boolean affectsTaskType(String taskType) {
        if (affectedTaskTypes.contains("*")) return true;
        if (taskType == null) return false;
        String normalized = taskType.toLowerCase().trim();
        return affectedTaskTypes.stream()
                .anyMatch(type -> normalized.contains(type) || type.contains(normalized));
    }

    /**
     * Calculate increase percentage based on task type match strength.
     */
    public int calculateIncrease(String taskType) {
        if (!affectsTaskType(taskType)) return 0;
        // Use midpoint; agentic gets higher impact
        if (this == AGENTIC_V1) {
            return (minIncreasePct + maxIncreasePct) / 2;
        }
        return (minIncreasePct + maxIncreasePct) / 2;
    }

    /**
     * Generate explanation for task impact.
     */
    public String generateExplanation(String taskName) {
        return String.format(explanationTemplate, taskName.toLowerCase());
    }

    /**
     * Find rule by ID.
     */
    public static AiCapabilityImpactRule findById(String id) {
        if (id == null) return null;
        for (AiCapabilityImpactRule rule : values()) {
            if (rule.id.equalsIgnoreCase(id.trim())) {
                return rule;
            }
        }
        return null;
    }

    /**
     * Get all available AI capability options.
     */
    public static List<AiCapabilityImpactRule> allCapabilities() {
        return List.of(values());
    }
}
