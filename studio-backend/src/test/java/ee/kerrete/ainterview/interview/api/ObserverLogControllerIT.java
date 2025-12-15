package ee.kerrete.ainterview.interview.api;

import ee.kerrete.ainterview.AbstractIntegrationTest;
import ee.kerrete.ainterview.interview.service.InterviewAuditService;
import ee.kerrete.ainterview.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ObserverLogControllerIT extends AbstractIntegrationTest {

    @Autowired
    private InterviewAuditService interviewAuditService;

    @Test
    void observerLogReturnsEntriesWithMessageAndSession() throws Exception {
        createUser("obs@example.com", "Password1!", true, UserRole.USER);
        String token = loginAndGetToken("obs@example.com", "Password1!");

        UUID sessionUuid = UUID.randomUUID();
        interviewAuditService.appendEvent(sessionUuid, ee.kerrete.ainterview.model.InterviewSessionEventType.DECISION_MADE, Map.of(
            "message", "Decision engine selected next action",
            "decision", "opening",
            "reason", "next_question_selected",
            "questionId", "INTRO_0001",
            "nextStyle", "SYSTEM",
            "nextDimension", "intro"
        ));

        mockMvc.perform(get("/api/observer-log")
                .param("sessionKey", sessionUuid.toString())
                .header("Authorization", "Bearer " + token)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].message").isNotEmpty())
            .andExpect(jsonPath("$[0].decision").value("opening"))
            .andExpect(jsonPath("$[0].questionId").value("INTRO_0001"));
    }
}

