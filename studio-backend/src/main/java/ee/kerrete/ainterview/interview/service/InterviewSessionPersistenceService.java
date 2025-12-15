package ee.kerrete.ainterview.interview.service;

import ee.kerrete.ainterview.dto.CreateInterviewSessionRequest;
import ee.kerrete.ainterview.dto.CreateInterviewSessionResponse;
import ee.kerrete.ainterview.model.InterviewSession;
import ee.kerrete.ainterview.repository.InterviewSessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewSessionPersistenceService {

    private static final String DEFAULT_VALUE = "unspecified";

    private final InterviewSessionRepository interviewSessionRepository;

    public CreateInterviewSessionResponse createSession(CreateInterviewSessionRequest request) {
        UUID sessionUuid = UUID.randomUUID();

        InterviewSession entity = InterviewSession.builder()
            .company(DEFAULT_VALUE)
            .role(DEFAULT_VALUE)
            .seniority(null)
            .sessionUuid(sessionUuid)
            .questionAnswers(null)
            .currentDimension(null)
            .currentQuestionId(null)
            .currentQuestionText(null)
            .askedQuestionIds(null)
            .candidateSummaryJson("{}")
            .candidateSummaryUpdatedAt(LocalDateTime.now())
            .interviewProfileJson("{}")
            .createdAt(LocalDateTime.now())
            .build();

        InterviewSession saved = Objects.requireNonNull(interviewSessionRepository.save(entity));

        CreateInterviewSessionResponse response = new CreateInterviewSessionResponse();
        response.setSessionId(saved.getId());
        response.setEmail(request.getEmail());
        response.setSessionUuid(saved.getSessionUuid());
        return response;
    }

    public InterviewSession getByIdOrThrow(Long id) {
        return interviewSessionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Interview session not found: " + id));
    }
}


