package ee.kerrete.ainterview.interview.api;

import ee.kerrete.ainterview.model.InterviewSessionEventType;
import ee.kerrete.ainterview.interview.service.InterviewAuditService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.profiles.active=test")
@AutoConfigureMockMvc(addFilters = false)
class AdminInterviewAuditControllerPayloadTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InterviewAuditService interviewAuditService;

    @Test
    void auditEndpointReturnsPayload() throws Exception {
        UUID sessionUuid = UUID.randomUUID();
        interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.ANSWER_RECORDED, Map.of(
            "questionId", "INTRO_0001",
            "answer", "Test answer",
            "fitScore", 78
        ));

        mockMvc.perform(get("/api/admin/interviews/{sessionUuid}/audit", sessionUuid))
            .andExpect(status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].payload.questionId").value("INTRO_0001"))
            .andExpect(jsonPath("$[0].payload.fitScore").value(78));
    }
}

