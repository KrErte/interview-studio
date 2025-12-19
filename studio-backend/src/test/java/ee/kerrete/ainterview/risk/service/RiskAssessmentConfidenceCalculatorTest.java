package ee.kerrete.ainterview.risk.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RiskAssessmentConfidenceCalculatorTest {

    private final RiskAssessmentConfidenceCalculator calc = new RiskAssessmentConfidenceCalculator();

    @Test
    void zeroAnswersHasBaseline() {
        var result = calc.compute(List.of(), List.of());
        assertThat(result.getConfidence()).isGreaterThanOrEqualTo(0.10);
        assertThat(result.getConfidence()).isLessThanOrEqualTo(0.25);
    }

    @Test
    void threeDiverseAnswersReachAboveFortyPercent() {
        var answers = List.of(
                RiskAssessmentConfidenceCalculator.Answer.builder().questionId("q:0").questionText("What is your role?").answer("Senior backend engineer, 7 years experience").build(),
                RiskAssessmentConfidenceCalculator.Answer.builder().questionId("q:1").questionText("Impact?").answer("Improved latency from 400ms to 120ms and cut costs 20%").build(),
                RiskAssessmentConfidenceCalculator.Answer.builder().questionId("q:2").questionText("Learning").answer("Completed AWS SA course and design patterns training").build()
        );
        var result = calc.compute(answers, List.of());
        assertThat(result.getConfidence()).isGreaterThanOrEqualTo(0.40);
    }

    @Test
    void tenAnswersReachAboveSixtyFivePercent() {
        var answers = List.of(
                ans("q:0", "Role", "Lead backend engineer, 10 years, Java/Node"),
                ans("q:1", "Stack", "Kubernetes, Docker, AWS, PostgreSQL"),
                ans("q:2", "Impact", "Reduced error rate by 35% and saved $200k annually"),
                ans("q:3", "Leadership", "Mentored 5 engineers and managed stakeholders"),
                ans("q:4", "System design", "Designed event-driven architecture with Kafka"),
                ans("q:5", "Learning", "Finished ML course and security certification"),
                ans("q:6", "Industry", "Fintech payments domain"),
                ans("q:7", "Achievements", "Improved throughput 3x"),
                ans("q:8", "Resilience", "Added circuit breakers, reduced MTTR to 20m"),
                ans("q:9", "Collaboration", "Coordinated with product and data teams")
        );
        var result = calc.compute(answers, List.of());
        assertThat(result.getConfidence()).isGreaterThanOrEqualTo(0.65);
    }

    @Test
    void contradictionsReduceButDoNotCollapse() {
        var answers = List.of(
                ans("q:0", "Role", "Senior backend engineer, 1 year experience"),
                ans("q:1", "Impact", "Improved latency from 400ms to 120ms"),
                ans("q:2", "Stack", "Kubernetes and AWS")
        );
        var result = calc.compute(answers, List.of());
        assertThat(result.getConfidence()).isGreaterThanOrEqualTo(0.30);
    }

    private RiskAssessmentConfidenceCalculator.Answer ans(String id, String q, String a) {
        return RiskAssessmentConfidenceCalculator.Answer.builder()
                .questionId(id)
                .questionText(q)
                .answer(a)
                .build();
    }
}

