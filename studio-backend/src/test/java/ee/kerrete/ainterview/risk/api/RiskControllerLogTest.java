package ee.kerrete.ainterview.risk.api;

import ee.kerrete.ainterview.dto.ObserverLogCreateCommand;
import ee.kerrete.ainterview.model.ObserverStage;
import ee.kerrete.ainterview.risk.dto.RefineResponse;
import ee.kerrete.ainterview.risk.service.ReplaceabilityRiskService;
import ee.kerrete.ainterview.interview.service.InterviewProfileService;
import ee.kerrete.ainterview.repository.TrainingTaskRepository;
import ee.kerrete.ainterview.service.ObserverLogService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RiskController.class)
class RiskControllerLogTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReplaceabilityRiskService replaceabilityRiskService;

    @MockBean
    private InterviewProfileService interviewProfileService;

    @MockBean
    private TrainingTaskRepository trainingTaskRepository;

    @MockBean
    private ObserverLogService observerLogService;

    @Test
    @SuppressWarnings("DataFlowIssue")
    void logsReassessmentWithSafeSummary() throws Exception {
        RefineResponse response = new RefineResponse();
        response.setReplaceabilityPct(48);
        response.setDeltaPct(-4);
        response.setConfidence("HIGH");
        response.setRisks(List.of("depth_gap", "automation_risk"));
        response.setStrengths(List.of("initiative", "ownership"));

        Mockito.when(replaceabilityRiskService.refine(any())).thenReturn(response);

        UUID session = UUID.randomUUID();
        String payload = "{\"analysisId\":\"a1\",\"answers\":[],\"sessionId\":\"" + session + "\"}";

        mockMvc.perform(post("/api/risk/refine")
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isOk());

        ArgumentCaptor<ObserverLogCreateCommand> captor = ArgumentCaptor.forClass(ObserverLogCreateCommand.class);
        Mockito.verify(observerLogService, Mockito.atLeastOnce()).record(captor.capture());

        boolean hasReassessment = captor.getAllValues().stream()
                .anyMatch(cmd -> ObserverStage.REASSESSMENT.equals(cmd.getStage()));
        assertThat(hasReassessment).isTrue();

        ObserverLogCreateCommand cmd = captor.getAllValues().stream()
                .filter(c -> ObserverStage.REASSESSMENT.equals(c.getStage()))
                .findFirst()
                .orElseThrow();

        assertThat(cmd.getRationaleSummary()).isNotBlank();
        assertThat(cmd.getRationaleSummary().length()).isLessThanOrEqualTo(600);
    }
}

