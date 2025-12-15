package ee.kerrete.ainterview.interview.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class NarrativeServiceTest {

    private final NarrativeService service = new NarrativeService();

    @Test
    void producesThreeToSixSentences() {
        var res = service.buildNarrative("SOLID", List.of("Ownership"), List.of("Needs more depth"), List.of("Stakeholder management"), "NEUTRAL");
        int sentences = res.narrative().split("\\. ").length;
        assertThat(sentences).isBetween(3, 6);
    }

    @Test
    void avoidsAbsolutes() {
        var res = service.buildNarrative("FOUNDATIONAL", List.of(), List.of(), List.of(), "NEUTRAL");
        assertThat(res.narrative().toLowerCase()).doesNotContain("always").doesNotContain("never").doesNotContain("completely").doesNotContain("totally");
    }

    @Test
    void endsForwardLooking() {
        var res = service.buildNarrative("EMERGING", List.of("Metrics"), List.of("Specificity"), List.of(), "POSITIVE");
        String lower = res.narrative().toLowerCase();
        assertThat(lower.contains("could") || lower.contains("consider") || lower.contains("one approach")).isTrue();
    }

    @Test
    void bandDefaultFoundational() {
        var res = service.buildNarrative(null, List.of(), List.of(), List.of(), "NEUTRAL");
        assertThat(res.band()).isEqualTo("FOUNDATIONAL");
    }

    @Test
    void toneAdaptsClosing() {
        var resNeg = service.buildNarrative("SOLID", List.of(), List.of("Depth"), List.of(), "NEGATIVE");
        assertThat(resNeg.narrative()).contains("approach");
    }
}


