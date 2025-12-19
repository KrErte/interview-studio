package ee.kerrete.ainterview.risk.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.risk.dto.AssessmentNextQuestionRequest;
import ee.kerrete.ainterview.risk.dto.AssessmentStartRequest;
import ee.kerrete.ainterview.risk.dto.AssessmentSubmitAnswerRequest;
import ee.kerrete.ainterview.risk.dto.RiskAssessmentResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartResponse;
import ee.kerrete.ainterview.risk.service.RiskFlowService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RiskAssessmentController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {RiskAssessmentController.class})
@SuppressWarnings("null")
class RiskAssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RiskFlowService riskFlowService;

    @Test
    void startReturns401WhenUnauthenticated() throws Exception {
        AssessmentStartRequest req = new AssessmentStartRequest();
        req.setPersona("persona");

        mockMvc.perform(post("/api/risk/assessment/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void startReturns200WhenAuthenticated() throws Exception {
        AssessmentStartRequest req = new AssessmentStartRequest();
        req.setDepth("STANDARD");
        RiskFlowStartResponse resp = RiskFlowStartResponse.builder()
                .flowId(UUID.fromString("00000000-0000-0000-0000-000000000111"))
                .sessionId("00000000-0000-0000-0000-000000000111")
                .email("user@example.com")
                .status("STARTED")
                .message("ok")
                .build();

        Mockito.when(riskFlowService.start(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/assessment/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.flowId").value(resp.getFlowId().toString()))
                .andExpect(jsonPath("$.status").value("STARTED"));
    }

    @Test
    void nextQuestionReturns401WhenUnauthenticated() throws Exception {
        AssessmentNextQuestionRequest req = new AssessmentNextQuestionRequest();
        req.setSessionId("00000000-0000-0000-0000-000000000222");

        mockMvc.perform(post("/api/risk/assessment/next-question")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void nextQuestionReturns200WhenAuthenticated() throws Exception {
        AssessmentNextQuestionRequest req = new AssessmentNextQuestionRequest();
        req.setSessionId("00000000-0000-0000-0000-000000000222");

        RiskFlowNextResponse resp = RiskFlowNextResponse.builder()
                .flowId(req.getSessionId())
                .questionId(req.getSessionId() + ":q1")
                .question("How do you use AI in your role?")
                .index(1)
                .totalPlanned(3)
                .done(false)
                .build();

        Mockito.when(riskFlowService.next(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/assessment/next-question")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.flowId").value(resp.getFlowId()))
                .andExpect(jsonPath("$.done").value(false));
    }

    @Test
    void submitAnswerReturns401WhenUnauthenticated() throws Exception {
        AssessmentSubmitAnswerRequest req = new AssessmentSubmitAnswerRequest();
        req.setSessionId("00000000-0000-0000-0000-000000000333");
        req.setQuestionId("q1");
        req.setAnswer("text");

        mockMvc.perform(post("/api/risk/assessment/submit-answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void submitAnswerReturns200WhenAuthenticated() throws Exception {
        AssessmentSubmitAnswerRequest req = new AssessmentSubmitAnswerRequest();
        req.setSessionId("00000000-0000-0000-0000-000000000333");
        req.setQuestionId("q1");
        req.setAnswer("Because impact matters");

        RiskFlowAnswerResponse resp = RiskFlowAnswerResponse.builder()
                .flowId(req.getSessionId())
                .questionId(req.getQuestionId())
                .status("RECEIVED")
                .receivedAt("2024-01-01T00:00:00Z")
                .build();

        Mockito.when(riskFlowService.answer(Mockito.anyString(), Mockito.any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/risk/assessment/submit-answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEIVED"))
                .andExpect(jsonPath("$.flowId").value(resp.getFlowId()));
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void getAssessmentReturns200() throws Exception {
        UUID sessionUuid = UUID.fromString("00000000-0000-0000-0000-000000000999");
        RiskAssessmentResponse resp = RiskAssessmentResponse.builder()
                .sessionId(sessionUuid)
                .riskPercent(42)
                .riskBand("MEDIUM")
                .confidence(0.6)
                .weaknesses(List.of())
                .signals(List.of())
                .build();

        Mockito.when(riskFlowService.assessment(Mockito.anyString(), Mockito.eq(sessionUuid)))
                .thenReturn(resp);

        mockMvc.perform(get("/api/risk/assessment/" + sessionUuid)
                        .contentType(MediaType.APPLICATION_JSON)
                        .principal(() -> "user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(sessionUuid.toString()))
                .andExpect(jsonPath("$.riskPercent").value(42));
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void getAssessmentReturns404WhenMissing() throws Exception {
        UUID sessionUuid = UUID.fromString("00000000-0000-0000-0000-000000000888");
        Mockito.when(riskFlowService.assessment(Mockito.anyString(), Mockito.eq(sessionUuid)))
                .thenThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Assessment not found for session"));

        mockMvc.perform(get("/api/risk/assessment/" + sessionUuid)
                        .contentType(MediaType.APPLICATION_JSON)
                        .principal(() -> "user@example.com"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("404 NOT_FOUND"))
                .andExpect(jsonPath("$.sessionUuid").value(sessionUuid.toString()));
    }
}

