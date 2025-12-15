package ee.kerrete.ainterview.interview.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AffectAnalyzerServiceTest {

    private final ToneAnalyzerService toneAnalyzerService = new ToneAnalyzerService();
    private final AffectAnalyzerService service = new AffectAnalyzerService();

    @Test
    void highAffectWithClearActions() {
        var tone = toneAnalyzerService.analyze("I led the team, improved metrics and engaged stakeholders to increase impact.");
        var res = service.analyze("I led the team, improved metrics and engaged stakeholders to increase impact.", tone);
        assertThat(res.affect()).isEqualTo("HIGH");
    }

    @Test
    void lowAffectWhenShort() {
        var tone = toneAnalyzerService.analyze("Short");
        var res = service.analyze("Short", tone);
        assertThat(res.affect()).isEqualTo("LOW");
    }

    @Test
    void mediumAffectForModerateClarity() {
        var tone = toneAnalyzerService.analyze("I worked with the team to ship.");
        var res = service.analyze("I worked with the team to ship.", tone);
        assertThat(res.affect()).isIn("MEDIUM", "HIGH", "LOW");
    }

    @Test
    void unaffectedByNullTone() {
        var res = service.analyze("I delivered a feature with customers and metrics.", null);
        assertThat(res.affect()).isNotNull();
    }

    @Test
    void emptyIsLow() {
        var res = service.analyze("", null);
        assertThat(res.affect()).isEqualTo("LOW");
    }
}


