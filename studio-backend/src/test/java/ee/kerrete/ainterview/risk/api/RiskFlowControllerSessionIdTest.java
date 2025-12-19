package ee.kerrete.ainterview.risk.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.risk.service.RiskFlowService;
import ee.kerrete.ainterview.risk.service.RiskQuestionBank;
import ee.kerrete.ainterview.support.SessionIdParser;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RiskFlowController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({RiskFlowService.class, RiskQuestionBank.class, SessionIdParser.class})
@TestPropertySource(properties = "risk.mock.enabled=true")
@SuppressWarnings("null")
class RiskFlowControllerSessionIdTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ee.kerrete.ainterview.service.ObserverLogService observerLogService;

    @Test
    void nextAcceptsUuidSessionId() throws Exception {
        String startJson = mockMvc.perform(post("/api/risk/flow/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode node = objectMapper.readTree(startJson);
        String sessionId = node.get("sessionId").asText();

        mockMvc.perform(post("/api/risk/flow/next")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"" + sessionId + "\"}")
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.done").value(false));
    }

    @Test
    void nextAcceptsMockSessionIdWhenAllowed() throws Exception {
        mockMvc.perform(post("/api/risk/flow/next")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"mock-session-123\"}")
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.flowId").exists());
    }

    @Test
    void nextRejectsGarbageSessionId() throws Exception {
        mockMvc.perform(post("/api/risk/flow/next")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"abc\"}")
                        .principal(() -> "user@example.com"))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason(is("Invalid sessionId. Expected UUID or mock-session-<digits>.")));
    }
}

