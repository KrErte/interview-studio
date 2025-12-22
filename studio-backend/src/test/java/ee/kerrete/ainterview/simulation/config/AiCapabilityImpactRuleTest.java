package ee.kerrete.ainterview.simulation.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for AiCapabilityImpactRule enum.
 */
class AiCapabilityImpactRuleTest {

    @Test
    @DisplayName("findById returns correct rule for valid ID")
    void findById_validId_returnsRule() {
        assertThat(AiCapabilityImpactRule.findById("code-gen-v2")).isEqualTo(AiCapabilityImpactRule.CODE_GEN_V2);
        assertThat(AiCapabilityImpactRule.findById("reasoning-v2")).isEqualTo(AiCapabilityImpactRule.REASONING_V2);
        assertThat(AiCapabilityImpactRule.findById("agentic-v1")).isEqualTo(AiCapabilityImpactRule.AGENTIC_V1);
    }

    @Test
    @DisplayName("findById is case-insensitive")
    void findById_caseInsensitive() {
        assertThat(AiCapabilityImpactRule.findById("CODE-GEN-V2")).isEqualTo(AiCapabilityImpactRule.CODE_GEN_V2);
        assertThat(AiCapabilityImpactRule.findById("Code-Gen-V2")).isEqualTo(AiCapabilityImpactRule.CODE_GEN_V2);
    }

    @Test
    @DisplayName("findById returns null for unknown ID")
    void findById_unknownId_returnsNull() {
        assertThat(AiCapabilityImpactRule.findById("unknown")).isNull();
        assertThat(AiCapabilityImpactRule.findById(null)).isNull();
    }

    @ParameterizedTest
    @CsvSource({
        "code-gen-v2, coding, true",
        "code-gen-v2, debugging, true",
        "code-gen-v2, communication, false",
        "reasoning-v2, analysis, true",
        "reasoning-v2, coding, false",
        "multimodal-v2, visual, true"
    })
    @DisplayName("affectsTaskType correctly identifies affected tasks")
    void affectsTaskType(String capabilityId, String taskType, boolean expected) {
        AiCapabilityImpactRule rule = AiCapabilityImpactRule.findById(capabilityId);
        assertThat(rule).isNotNull();
        assertThat(rule.affectsTaskType(taskType)).isEqualTo(expected);
    }

    @Test
    @DisplayName("agentic capability affects all task types (wildcard)")
    void agenticAffectsAllTasks() {
        AiCapabilityImpactRule agentic = AiCapabilityImpactRule.AGENTIC_V1;

        assertThat(agentic.affectsTaskType("coding")).isTrue();
        assertThat(agentic.affectsTaskType("communication")).isTrue();
        assertThat(agentic.affectsTaskType("any-task")).isTrue();
    }

    @Test
    @DisplayName("calculateIncrease returns positive value for affected tasks")
    void calculateIncrease_affectedTask() {
        AiCapabilityImpactRule codeGen = AiCapabilityImpactRule.CODE_GEN_V2;
        int increase = codeGen.calculateIncrease("coding");

        assertThat(increase).isGreaterThan(0);
        assertThat(increase).isBetween(codeGen.getMinIncreasePct(), codeGen.getMaxIncreasePct());
    }

    @Test
    @DisplayName("calculateIncrease returns zero for unaffected tasks")
    void calculateIncrease_unaffectedTask() {
        AiCapabilityImpactRule codeGen = AiCapabilityImpactRule.CODE_GEN_V2;
        int increase = codeGen.calculateIncrease("communication");

        assertThat(increase).isZero();
    }

    @Test
    @DisplayName("generateExplanation produces meaningful text")
    void generateExplanation() {
        AiCapabilityImpactRule codeGen = AiCapabilityImpactRule.CODE_GEN_V2;
        String explanation = codeGen.generateExplanation("Code review");

        assertThat(explanation).isNotBlank();
        assertThat(explanation.toLowerCase()).contains("code");
    }

    @Test
    @DisplayName("allCapabilities returns all enum values")
    void allCapabilities() {
        assertThat(AiCapabilityImpactRule.allCapabilities())
                .hasSize(AiCapabilityImpactRule.values().length)
                .contains(AiCapabilityImpactRule.CODE_GEN_V2, AiCapabilityImpactRule.AGENTIC_V1);
    }

    @Test
    @DisplayName("Impact levels are correctly assigned")
    void impactLevels() {
        assertThat(AiCapabilityImpactRule.CODE_GEN_V2.getImpactLevel()).isEqualTo("high");
        assertThat(AiCapabilityImpactRule.MULTIMODAL_V2.getImpactLevel()).isEqualTo("medium");
        assertThat(AiCapabilityImpactRule.AGENTIC_V1.getImpactLevel()).isEqualTo("extreme");
    }
}
