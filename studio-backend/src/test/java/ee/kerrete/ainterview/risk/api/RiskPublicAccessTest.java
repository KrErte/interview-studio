package ee.kerrete.ainterview.risk.api;

import ee.kerrete.ainterview.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RiskPublicAccessTest extends AbstractIntegrationTest {

    @Test
    void riskQuestions_shouldAllowAnonymous() throws Exception {
        mockMvc.perform(get("/api/risk/questions")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk());
    }

    @Test
    void candidateDashboard_shouldRequireAuth() throws Exception {
        mockMvc.perform(get("/api/candidate/dashboard")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isUnauthorized());
    }
}

