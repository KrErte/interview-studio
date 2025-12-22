package ee.kerrete.ainterview.evidence.service;

import ee.kerrete.ainterview.evidence.model.EvidenceStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Unit tests for EvidenceDecayCalculator.
 */
class EvidenceDecayCalculatorTest {

    private EvidenceDecayCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new EvidenceDecayCalculator();
    }

    @Nested
    @DisplayName("Weight Calculation Tests")
    class WeightCalculationTests {

        @Test
        @DisplayName("Fresh evidence (0 days) has weight 1.0")
        void freshEvidenceHasMaxWeight() {
            double weight = calculator.calculateWeight(0);
            assertThat(weight).isEqualTo(1.0);
        }

        @Test
        @DisplayName("Evidence at half-life (90 days) has weight ~0.5")
        void evidenceAtHalfLifeHasHalfWeight() {
            double weight = calculator.calculateWeight(90);
            assertThat(weight).isCloseTo(0.5, within(0.01));
        }

        @Test
        @DisplayName("Evidence at double half-life (180 days) has weight ~0.25")
        void evidenceAtDoubleHalfLifeHasQuarterWeight() {
            double weight = calculator.calculateWeight(180);
            assertThat(weight).isCloseTo(0.25, within(0.01));
        }

        @Test
        @DisplayName("Very old evidence never goes below minimum weight 0.2")
        void veryOldEvidenceHasMinimumWeight() {
            double weight = calculator.calculateWeight(365);
            assertThat(weight).isGreaterThanOrEqualTo(0.2);

            double veryOldWeight = calculator.calculateWeight(1000);
            assertThat(veryOldWeight).isEqualTo(0.2);
        }

        @Test
        @DisplayName("Negative age returns max weight")
        void negativeAgeReturnsMaxWeight() {
            double weight = calculator.calculateWeight(-5);
            assertThat(weight).isEqualTo(1.0);
        }

        @ParameterizedTest
        @CsvSource({
            "0, 1.0",
            "7, 0.95",
            "14, 0.90",
            "30, 0.79",
            "60, 0.63",
            "90, 0.50",
            "180, 0.25",
            "270, 0.20"
        })
        @DisplayName("Weight decreases exponentially with age")
        void weightDecreasesExponentially(int ageDays, double expectedMinWeight) {
            double weight = calculator.calculateWeight(ageDays);
            assertThat(weight).isGreaterThanOrEqualTo(expectedMinWeight - 0.05);
        }

        @Test
        @DisplayName("Custom half-life affects decay rate")
        void customHalfLifeAffectsDecay() {
            // With 30-day half-life, 30 days should give ~0.5 weight
            double weight30days = calculator.calculateWeight(30, 30);
            assertThat(weight30days).isCloseTo(0.5, within(0.01));

            // With 180-day half-life, 90 days should give ~0.71 weight
            double weight180 = calculator.calculateWeight(90, 180);
            assertThat(weight180).isCloseTo(0.71, within(0.02));
        }
    }

    @Nested
    @DisplayName("Status Determination Tests")
    class StatusDeterminationTests {

        @ParameterizedTest
        @CsvSource({
            "0, FRESH",
            "7, FRESH",
            "14, FRESH",
            "15, STALE",
            "30, STALE",
            "60, STALE",
            "61, OLD",
            "120, OLD",
            "180, OLD",
            "181, ARCHIVE",
            "365, ARCHIVE"
        })
        @DisplayName("Status is correctly determined from age")
        void statusDeterminedFromAge(int ageDays, String expectedStatus) {
            EvidenceStatus status = calculator.determineStatus(ageDays);
            assertThat(status).isEqualTo(EvidenceStatus.valueOf(expectedStatus));
        }

        @Test
        @DisplayName("FRESH evidence does not need reanchor")
        void freshDoesNotNeedReanchor() {
            assertThat(calculator.needsReanchor(0)).isFalse();
            assertThat(calculator.needsReanchor(14)).isFalse();
        }

        @Test
        @DisplayName("STALE, OLD, and ARCHIVE evidence needs reanchor")
        void staleAndOlderNeedsReanchor() {
            assertThat(calculator.needsReanchor(15)).isTrue();
            assertThat(calculator.needsReanchor(61)).isTrue();
            assertThat(calculator.needsReanchor(181)).isTrue();
        }
    }

    @Nested
    @DisplayName("Configuration Tests")
    class ConfigurationTests {

        @Test
        @DisplayName("Default half-life is 90 days")
        void defaultHalfLifeIs90Days() {
            assertThat(calculator.getHalfLifeDays()).isEqualTo(90.0);
        }

        @Test
        @DisplayName("Minimum weight is 0.2")
        void minimumWeightIs02() {
            assertThat(calculator.getMinWeight()).isEqualTo(0.2);
        }

        @Test
        @DisplayName("Maximum weight is 1.0")
        void maximumWeightIs10() {
            assertThat(calculator.getMaxWeight()).isEqualTo(1.0);
        }
    }
}
