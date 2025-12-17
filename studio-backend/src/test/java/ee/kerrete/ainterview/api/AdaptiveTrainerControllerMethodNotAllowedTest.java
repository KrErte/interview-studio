package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.auth.jwt.JwtAuthenticationFilter;
import ee.kerrete.ainterview.auth.jwt.JwtService;
import ee.kerrete.ainterview.service.AiAdaptiveService;
import ee.kerrete.ainterview.service.SoftSkillQuestionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdaptiveTrainerController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdaptiveTrainerControllerMethodNotAllowedTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiAdaptiveService aiAdaptiveService;

    @MockBean
    private SoftSkillQuestionService softSkillQuestionService;

    // Security-related beans mocked to satisfy context
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void getSoftQuestion_returnsMethodNotAllowedWithErrorCode() throws Exception {
        mockMvc.perform(get("/api/trainer/soft-question"))
            .andExpect(status().isMethodNotAllowed())
            .andExpect(jsonPath("$.error").value("METHOD_NOT_ALLOWED"));
    }
}

