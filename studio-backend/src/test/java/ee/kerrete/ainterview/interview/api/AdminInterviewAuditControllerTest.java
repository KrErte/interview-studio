package ee.kerrete.ainterview.interview.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.interview.service.InterviewAuditService;
import ee.kerrete.ainterview.model.InterviewSessionEventType;
import ee.kerrete.ainterview.repository.InterviewSessionEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AdminInterviewAuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InterviewAuditService interviewAuditService;

    @Autowired
    private InterviewSessionEventRepository eventRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void clean() {
        eventRepository.deleteAll();
    }

    @Test
    void returnsAuditEvents() throws Exception {
        UUID sessionUuid = UUID.randomUUID();
        interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.ANSWER_RECORDED, Map.of("questionId", "Q1"));
        interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.DECISION_MADE, Map.of("decision", "complete"));

        mockMvc.perform(get("/api/admin/interviews/" + sessionUuid + "/audit")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].type").exists());
    }
}


