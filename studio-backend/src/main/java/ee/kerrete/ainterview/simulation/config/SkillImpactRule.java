package ee.kerrete.ainterview.simulation.config;

import lombok.Getter;

import java.util.List;
import java.util.Set;

/**
 * Rule-based configuration for how skills impact task exposure.
 * Each skill reduces exposure for certain task types by a percentage range.
 */
@Getter
public enum SkillImpactRule {
    PYTHON(
        "python",
        "Python/Automation",
        "technical",
        Set.of("repetitive", "data-processing", "data-entry", "reporting", "calculation"),
        15, 25,
        "%s automates %s tasks, but you control the logic and validation"
    ),
    PROMPT_ENGINEERING(
        "prompt-engineering",
        "Prompt Engineering",
        "ai",
        Set.of("ai-assisted", "content-generation", "summarization", "translation"),
        10, 20,
        "Better AI prompting skills let you direct %s tasks more effectively"
    ),
    STAKEHOLDER_MANAGEMENT(
        "stakeholder-management",
        "Stakeholder Management",
        "soft",
        Set.of("communication", "coordination", "negotiation", "relationship-building", "presentation"),
        20, 30,
        "Strong stakeholder skills make %s tasks uniquely human-dependent"
    ),
    DATA_ANALYSIS(
        "data-analysis",
        "Data Analysis",
        "technical",
        Set.of("analysis", "insights", "visualization", "pattern-recognition"),
        12, 22,
        "Advanced analysis skills add interpretive value to %s beyond AI capability"
    ),
    SYSTEM_DESIGN(
        "system-design",
        "System Design",
        "technical",
        Set.of("architecture", "planning", "integration", "scalability"),
        18, 28,
        "System design expertise makes %s require human judgment and experience"
    );

    private final String id;
    private final String name;
    private final String category;
    private final Set<String> affectedTaskTypes;
    private final int minReductionPct;
    private final int maxReductionPct;
    private final String explanationTemplate;

    SkillImpactRule(String id, String name, String category, Set<String> affectedTaskTypes,
                    int minReductionPct, int maxReductionPct, String explanationTemplate) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.affectedTaskTypes = affectedTaskTypes;
        this.minReductionPct = minReductionPct;
        this.maxReductionPct = maxReductionPct;
        this.explanationTemplate = explanationTemplate;
    }

    /**
     * Check if this skill affects the given task type.
     */
    public boolean affectsTaskType(String taskType) {
        if (taskType == null) return false;
        String normalized = taskType.toLowerCase().trim();
        return affectedTaskTypes.stream()
                .anyMatch(type -> normalized.contains(type) || type.contains(normalized));
    }

    /**
     * Calculate reduction percentage based on task type match strength.
     */
    public int calculateReduction(String taskType) {
        if (!affectsTaskType(taskType)) return 0;
        // Use midpoint for now; could be refined based on match strength
        return (minReductionPct + maxReductionPct) / 2;
    }

    /**
     * Generate explanation for task impact.
     */
    public String generateExplanation(String taskName) {
        return String.format(explanationTemplate, name, taskName.toLowerCase());
    }

    /**
     * Find rule by ID.
     */
    public static SkillImpactRule findById(String id) {
        if (id == null) return null;
        for (SkillImpactRule rule : values()) {
            if (rule.id.equalsIgnoreCase(id.trim())) {
                return rule;
            }
        }
        return null;
    }

    /**
     * Get all available skill options.
     */
    public static List<SkillImpactRule> allSkills() {
        return List.of(values());
    }
}
