package ee.kerrete.ainterview.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.interview.dto.CandidateSummaryDto;
import ee.kerrete.ainterview.model.InterviewSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CandidateSummaryServiceTest {

    private CandidateSummaryService service;

    @BeforeEach
    void setup() {
        service = new CandidateSummaryService(new ObjectMapper(), new ToneAnalyzerService(), new AffectAnalyzerService(), new NarrativeService());
    }

    @Test
    void addsMetricStrengthAndSignal() {
        InterviewSession session = InterviewSession.builder().build();

        CandidateSummaryDto dto = service.recordTurn(
            session,
            "q1",
            "Tell me about metrics",
            "Delivered 20% growth over 6 months",
            "probe",
            80,
            "improving",
            "ownership_accountability",
            1,
            4.0
        );

        assertThat(dto.getStrengths()).contains("Measures impact with metrics");
        assertThat(dto.getSignals().stream().map(CandidateSummaryDto.SignalDto::getLabel).toList())
            .contains("Evidence of metrics");
        assertThat(session.getCandidateSummaryJson()).isNotBlank();
    }

    @Test
    void shortAnswerAddsRisk() {
        InterviewSession session = InterviewSession.builder().build();

        CandidateSummaryDto dto = service.recordTurn(
            session,
            "q2",
            "Give a brief answer",
            "Quick update only",
            "probe",
            60,
            "flat",
            "collaboration",
            1,
            3.0
        );

        assertThat(dto.getGrowthAreas()).contains("Needs more depth");
    }

    @Test
    void evidenceCappedAtThree() {
        InterviewSession session = InterviewSession.builder().build();
        CandidateSummaryDto dto = null;
        for (int i = 0; i < 5; i++) {
            dto = service.recordTurn(
                session,
                "q" + i,
                "Question " + i,
                "Answer " + i + " with enough detail to store",
                "probe",
                70,
                "flat",
                "general",
                i + 1,
                3.0
            );
        }

        assertThat(dto).isNotNull();
        assertThat(dto.getEvidenceLast3()).hasSize(3);
        List<String> questions = dto.getEvidenceLast3().stream().map(CandidateSummaryDto.EvidenceDto::getQuestion).toList();
        assertThat(questions).contains("Question 2", "Question 3", "Question 4");
    }

    @Test
    void narrativeUsesCautiousLanguage() {
        InterviewSession session = InterviewSession.builder().build();

        CandidateSummaryDto dto = service.recordTurn(
            session,
            "q10",
            "Ownership question",
            "I owned the rollout and was responsible for success, working with the team and stakeholders to deliver",
            "probe",
            75,
            "improving",
            "ownership_accountability",
            1,
            4.5
        );

        assertThat(dto.getNarrative()).isNotBlank();
        assertThat(dto.getBand()).isNotBlank();
        assertThat(dto.getAffect()).isNotBlank();
    }
}


