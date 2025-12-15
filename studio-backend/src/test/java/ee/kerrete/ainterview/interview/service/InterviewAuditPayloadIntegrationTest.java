package ee.kerrete.ainterview.interview.service;

import ee.kerrete.ainterview.interview.dto.InterviewNextQuestionRequestDto;
import ee.kerrete.ainterview.model.InterviewSession;
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
    "spring.datasource.url=jdbc:h2:mem:audit_payload;DB_CLOSE_DELAY=-1;MODE=PostgreSQL"
})
class InterviewAuditPayloadIntegrationTest {

    @Autowired
    private InterviewIntelligenceService interviewIntelligenceService;

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private InterviewSessionEventRepository eventRepository;

    @Test
    @Transactional
    void answerAndDecisionEventsCarryPayload() {
        UUID sessionUuid = UUID.randomUUID();
        InterviewSession session = InterviewSession.builder()
            .company("TestCo")
            .role("Engineer")
            .sessionUuid(sessionUuid)
            .candidateSummaryJson("{}")
            .interviewProfileJson("{}")
            .build();
        sessionRepository.save(session);

        // first question (decision event)
        interviewIntelligenceService.nextQuestion(sessionUuid, null);
        // answer to create answer + decision events
        interviewIntelligenceService.nextQuestion(sessionUuid, new InterviewNextQuestionRequestDto("I took ownership of delivery and unblocked the team."));

        var events = eventRepository.findTop200BySessionUuidOrderByCreatedAtDesc(sessionUuid);

        var decision = events.stream().filter(e -> e.getEventType() == InterviewSessionEventType.DECISION_MADE).findFirst().orElseThrow();
        var answer = events.stream().filter(e -> e.getEventType() == InterviewSessionEventType.ANSWER_RECORDED).findFirst().orElseThrow();

        Map<?, ?> decisionPayload = json(decision.getPayloadJson());
        Map<?, ?> answerPayload = json(answer.getPayloadJson());

        assertThat(decisionPayload).isNotEmpty();
        assertThat(decisionPayload.containsKey("decision")).isTrue();
        assertThat(decisionPayload.containsKey("currentDimension")).isTrue();

        assertThat(answerPayload).isNotEmpty();
        assertThat(answerPayload.containsKey("question")).isTrue();
        assertThat(answerPayload.containsKey("answer")).isTrue();
        assertThat(answerPayload.containsKey("currentDimension")).isTrue();
    }

    private Map<?, ?> json(String json) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, Map.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

