package ee.kerrete.ainterview.risk.api;

import ee.kerrete.ainterview.config.GlobalExceptionHandler;
import ee.kerrete.ainterview.risk.service.MockRiskService;
import ee.kerrete.ainterview.risk.service.ReplaceabilityRiskService;
import ee.kerrete.ainterview.interview.service.InterviewProfileService;
import ee.kerrete.ainterview.repository.TrainingTaskRepository;
import ee.kerrete.ainterview.service.ObserverLogService;
import ee.kerrete.ainterview.support.SessionIdParser;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RiskController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {RiskController.class, SessionIdParser.class, MockRiskService.class, GlobalExceptionHandler.class})
class RiskControllerSessionIdTest {

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
    void summaryWithValidUuidReturns200() throws Exception {
        mockMvc.perform(get("/api/risk/summary")
                        .param("sessionId", "00000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskScore").exists());
    }

    @Test
    void summaryWithInvalidSessionIdReturns400() throws Exception {
        mockMvc.perform(get("/api/risk/summary")
                        .param("sessionId", "not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").exists());
    }
}

