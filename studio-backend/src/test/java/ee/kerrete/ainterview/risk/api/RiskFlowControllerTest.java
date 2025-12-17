package ee.kerrete.ainterview.risk.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowEvaluateRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowEvaluateResponse;
import ee.kerrete.ainterview.risk.service.RiskFlowService;
import ee.kerrete.ainterview.risk.web.RiskRequestNormalizationFilter;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RiskFlowController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {RiskFlowController.class, RiskRequestNormalizationFilter.class})
class RiskFlowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RiskFlowService riskFlowService;

    @Test
    void startReturns200AndPayload() throws Exception {
        RiskFlowStartRequest req = new RiskFlowStartRequest();
        req.setContext("demo");

        RiskFlowStartResponse resp = RiskFlowStartResponse.builder()
                .flowId(UUID.fromString("00000000-0000-0000-0000-000000000123"))
                .email("user@example.com")
                .sessionId("00000000-0000-0000-0000-000000000123")
                .startedAt("2024-01-01T00:00:00Z")
                .message("Risk flow started")
                .context("demo")
                .status("STARTED")
                .mode("STANDARD")
                .build();

        Mockito.when(riskFlowService.start(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/flow/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.flowId").value(resp.getFlowId().toString()))
                .andExpect(jsonPath("$.sessionId").value(resp.getSessionId()))
                .andExpect(jsonPath("$.email").value(resp.getEmail()))
                .andExpect(jsonPath("$.status").value("STARTED"));
    }

    @Test
    void startWithEmptyBodySucceeds() throws Exception {
        RiskFlowStartResponse resp = RiskFlowStartResponse.builder()
                .flowId(UUID.fromString("00000000-0000-0000-0000-000000000456"))
                .email("anon@example.com")
                .sessionId("00000000-0000-0000-0000-000000000456")
                .startedAt("2024-01-01T00:00:00Z")
                .message("Risk flow started")
                .context(null)
                .status("STARTED")
                .mode("STANDARD")
                .build();

        Mockito.when(riskFlowService.start(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/flow/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .principal(() -> "anon@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("STARTED"))
                .andExpect(jsonPath("$.sessionId").value(resp.getSessionId()));
    }

    @Test
    void nextReturnsQuestion() throws Exception {
        RiskFlowNextRequest req = new RiskFlowNextRequest();
        req.setFlowId(UUID.fromString("00000000-0000-0000-0000-000000000123"));

        RiskFlowNextResponse resp = RiskFlowNextResponse.builder()
                .flowId(req.getFlowId().toString())
                .questionId(req.getFlowId().toString() + ":0")
                .question("Which parts of your current role are least automatable?")
                .index(1)
                .totalPlanned(3)
                .done(false)
                .build();

        Mockito.when(riskFlowService.next(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/flow/next")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.flowId").value(resp.getFlowId()))
                .andExpect(jsonPath("$.question").value(resp.getQuestion()))
                .andExpect(jsonPath("$.done").value(false));
    }

    @Test
    void answerAcceptsPayload() throws Exception {
        RiskFlowAnswerRequest req = new RiskFlowAnswerRequest();
        req.setFlowId(UUID.fromString("00000000-0000-0000-0000-000000000123"));
        req.setQuestionId("q1");
        req.setAnswer("Because impact matters");

        RiskFlowAnswerResponse resp = RiskFlowAnswerResponse.builder()
                .flowId(req.getFlowId().toString())
                .questionId("q1")
                .status("RECEIVED")
                .receivedAt("2024-01-01T00:00:00Z")
                .build();

        Mockito.when(riskFlowService.answer(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/flow/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEIVED"))
                .andExpect(jsonPath("$.flowId").value(resp.getFlowId()));
    }

    @Test
    void answerWithTrailingDotIsNormalized() throws Exception {
        RiskFlowAnswerRequest req = new RiskFlowAnswerRequest();
        req.setFlowId(UUID.fromString("00000000-0000-0000-0000-000000000123"));
        req.setQuestionId("q1");
        req.setAnswer("Because impact matters");

        RiskFlowAnswerResponse resp = RiskFlowAnswerResponse.builder()
                .flowId(req.getFlowId().toString())
                .questionId("q1")
                .status("RECEIVED")
                .receivedAt("2024-01-01T00:00:00Z")
                .build();

        Mockito.when(riskFlowService.answer(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/flow/answer.")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEIVED"));
    }

    @Test
    void evaluateEndpointExists() throws Exception {
        RiskFlowEvaluateRequest req = new RiskFlowEvaluateRequest();
        req.setFlowId(UUID.fromString("00000000-0000-0000-0000-000000000789"));

        RiskFlowEvaluateResponse resp = RiskFlowEvaluateResponse.builder()
                .flowId(req.getFlowId().toString())
                .status("EVALUATED")
                .evaluatedAt("2024-01-01T00:00:00Z")
                .message("Evaluation stub")
                .build();

        Mockito.when(riskFlowService.evaluate(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/flow/evaluate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EVALUATED"))
                .andExpect(jsonPath("$.flowId").value(resp.getFlowId()));
    }
}

