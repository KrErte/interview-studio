package ee.kerrete.ainterview.interview.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ToneAnalyzerServiceTest {

    private final ToneAnalyzerService service = new ToneAnalyzerService();

    @Test
    void detectsPositiveTone() {
        ToneAnalyzerService.ToneResult r = service.analyze("I am excited and proud about the impact we made.");
        assertThat(r.tone()).isEqualTo("POSITIVE");
    }

    @Test
    void detectsNegativeTone() {
        ToneAnalyzerService.ToneResult r = service.analyze("I was frustrated and angry with the blockers.");
        assertThat(r.tone()).isEqualTo("NEGATIVE");
    }

    @Test
    void neutralWhenBalanced() {
        ToneAnalyzerService.ToneResult r = service.analyze("I provided an update to the team with facts.");
        assertThat(r.tone()).isEqualTo("NEUTRAL");
    }

    @Test
    void intensityCaps() {
        ToneAnalyzerService.ToneResult r = service.analyze("angry angry angry angry angry angry angry angry");
        assertThat(r.intensity()).isLessThanOrEqualTo(100);
    }

    @Test
    void emptyDefaultsNeutral() {
        ToneAnalyzerService.ToneResult r = service.analyze("");
        assertThat(r.tone()).isEqualTo("NEUTRAL");
    }
}


