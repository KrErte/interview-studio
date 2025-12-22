package ee.kerrete.ainterview.simulation.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for SkillImpactRule enum.
 */
class SkillImpactRuleTest {

    @Test
    @DisplayName("findById returns correct rule for valid ID")
    void findById_validId_returnsRule() {
        assertThat(SkillImpactRule.findById("python")).isEqualTo(SkillImpactRule.PYTHON);
        assertThat(SkillImpactRule.findById("prompt-engineering")).isEqualTo(SkillImpactRule.PROMPT_ENGINEERING);
        assertThat(SkillImpactRule.findById("stakeholder-management")).isEqualTo(SkillImpactRule.STAKEHOLDER_MANAGEMENT);
    }

    @Test
    @DisplayName("findById is case-insensitive")
    void findById_caseInsensitive() {
        assertThat(SkillImpactRule.findById("PYTHON")).isEqualTo(SkillImpactRule.PYTHON);
        assertThat(SkillImpactRule.findById("Python")).isEqualTo(SkillImpactRule.PYTHON);
    }

    @Test
    @DisplayName("findById returns null for unknown ID")
    void findById_unknownId_returnsNull() {
        assertThat(SkillImpactRule.findById("unknown")).isNull();
        assertThat(SkillImpactRule.findById(null)).isNull();
    }

    @ParameterizedTest
    @CsvSource({
        "python, data-processing, true",
        "python, repetitive, true",
        "python, communication, false",
        "prompt-engineering, ai-assisted, true",
        "prompt-engineering, coding, false",
        "stakeholder-management, communication, true",
        "stakeholder-management, data-entry, false"
    })
    @DisplayName("affectsTaskType correctly identifies affected tasks")
    void affectsTaskType(String skillId, String taskType, boolean expected) {
        SkillImpactRule rule = SkillImpactRule.findById(skillId);
        assertThat(rule).isNotNull();
        assertThat(rule.affectsTaskType(taskType)).isEqualTo(expected);
    }

    @Test
    @DisplayName("calculateReduction returns positive value for affected tasks")
    void calculateReduction_affectedTask() {
        SkillImpactRule python = SkillImpactRule.PYTHON;
        int reduction = python.calculateReduction("data-processing");

        assertThat(reduction).isGreaterThan(0);
        assertThat(reduction).isBetween(python.getMinReductionPct(), python.getMaxReductionPct());
    }

    @Test
    @DisplayName("calculateReduction returns zero for unaffected tasks")
    void calculateReduction_unaffectedTask() {
        SkillImpactRule python = SkillImpactRule.PYTHON;
        int reduction = python.calculateReduction("communication");

        assertThat(reduction).isZero();
    }

    @Test
    @DisplayName("generateExplanation produces meaningful text")
    void generateExplanation() {
        SkillImpactRule python = SkillImpactRule.PYTHON;
        String explanation = python.generateExplanation("Data validation");

        assertThat(explanation).isNotBlank();
        assertThat(explanation).contains("Python/Automation");
        assertThat(explanation.toLowerCase()).contains("data validation");
    }

    @Test
    @DisplayName("allSkills returns all enum values")
    void allSkills() {
        assertThat(SkillImpactRule.allSkills())
                .hasSize(SkillImpactRule.values().length)
                .contains(SkillImpactRule.PYTHON, SkillImpactRule.PROMPT_ENGINEERING);
    }
}
