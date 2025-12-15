package ee.kerrete.ainterview.interview.service;

import ee.kerrete.ainterview.interview.dto.InterviewNextQuestionRequestDto;
import ee.kerrete.ainterview.model.InterviewSession;
import ee.kerrete.ainterview.repository.InterviewSessionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class InterviewIntelligenceServiceIntegrationTest {

    @Autowired
    private InterviewIntelligenceService service;

    @Autowired
    private InterviewSessionRepository repository;

    @Test
    void questionCountPersistsAndOpeningDoesNotRepeat() {
        InterviewSession session = InterviewSession.builder()
            .company("acme")
            .role("engineer")
            .seniority("mid")
            .sessionUuid(UUID.randomUUID())
            .questionAnswers("[]")
            .questionCount(0)
            .createdAt(LocalDateTime.now())
            .build();
        repository.save(session);

        UUID uuid = session.getSessionUuid();

        var resp1 = service.nextQuestion(uuid, null);
        InterviewSession afterFirst = repository.findBySessionUuid(uuid).orElseThrow();

        assertThat(afterFirst.getQuestionCount()).isEqualTo(1);
        assertThat(afterFirst.getCurrentQuestionId()).isNotBlank();
        assertThat(afterFirst.getCurrentQuestionId()).startsWith("INTRO_");
        assertThat(afterFirst.getCurrentDimension()).isNull();
        String firstQuestion = resp1.getQuestion();

        var resp2 = service.nextQuestion(uuid, new InterviewNextQuestionRequestDto("second answer"));
        InterviewSession afterSecond = repository.findBySessionUuid(uuid).orElseThrow();

        assertThat(afterSecond.getQuestionCount()).isEqualTo(2);
        assertThat(afterSecond.getQuestionAnswers()).contains("second answer");
        assertThat(resp2.getDecision()).isNotEqualTo("opening");
        assertThat(resp2.getQuestion()).isNotEqualTo(firstQuestion);
    }

    @Test
    void emptyBodyAllowedOnlyForFirstQuestion() {
        InterviewSession session = InterviewSession.builder()
            .company("acme")
            .role("engineer")
            .seniority("mid")
            .sessionUuid(UUID.randomUUID())
            .questionAnswers("[]")
            .questionCount(0)
            .createdAt(LocalDateTime.now())
            .build();
        repository.save(session);

        UUID uuid = session.getSessionUuid();

        var resp1 = service.nextQuestion(uuid, null);
        assertThat(resp1.getDecision()).isEqualTo("opening");

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.nextQuestion(uuid, null))
            .isInstanceOf(ResponseStatusException.class);
    }
}

