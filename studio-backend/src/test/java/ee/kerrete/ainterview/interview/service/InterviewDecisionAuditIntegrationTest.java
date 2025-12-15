package ee.kerrete.ainterview.interview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.model.InterviewSession;
import ee.kerrete.ainterview.model.InterviewSessionEvent;
import ee.kerrete.ainterview.model.InterviewSessionEventType;
import ee.kerrete.ainterview.repository.InterviewSessionEventRepository;
import ee.kerrete.ainterview.repository.InterviewSessionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:decision_audit;DB_CLOSE_DELAY=-1;MODE=PostgreSQL"
})
class InterviewDecisionAuditIntegrationTest {

    @Autowired
    private InterviewIntelligenceService interviewIntelligenceService;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private InterviewSessionEventRepository eventRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @Transactional
    void decisionMadeEventCarriesPayload() throws Exception {
        UUID sessionUuid = UUID.randomUUID();
        InterviewSession session = InterviewSession.builder()
            .company("TestCo")
            .role("Engineer")
            .sessionUuid(sessionUuid)
            .candidateSummaryJson("{}")
            .interviewProfileJson("{}")
            .build();
        interviewSessionRepository.save(session);

        interviewIntelligenceService.nextQuestion(sessionUuid, null);

        InterviewSessionEvent decisionEvent = eventRepository.findTop200BySessionUuidOrderByCreatedAtDesc(sessionUuid)
            .stream()
            .filter(ev -> ev.getEventType() == InterviewSessionEventType.DECISION_MADE)
            .findFirst()
            .orElseThrow();

        Map<String, Object> payload = objectMapper.readValue(decisionEvent.getPayloadJson(), Map.class);

        assertThat(payload).isNotEmpty();
        assertThat(payload).containsKeys("decision", "currentDimension");
        assertThat(payload.get("decision")).isNotNull();
    }
}

