package ee.kerrete.ainterview.pivot.service;

import ee.kerrete.ainterview.pivot.dto.FutureProofScoreResponse;
import ee.kerrete.ainterview.pivot.entity.PivotFutureProofScore;
import ee.kerrete.ainterview.pivot.entity.FutureProofScoreEvent;
import ee.kerrete.ainterview.pivot.entity.PivotRoleMatch;
import ee.kerrete.ainterview.pivot.entity.TransitionProfile;
import ee.kerrete.ainterview.pivot.enums.ScoreTriggerType;
import ee.kerrete.ainterview.pivot.repository.FutureProofScoreEventRepository;
import ee.kerrete.ainterview.pivot.repository.PivotFutureProofScoreRepository;
import ee.kerrete.ainterview.pivot.repository.TransitionProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service("pivotFutureProofScoreService")
@RequiredArgsConstructor
public class PivotFutureProofScoreService {

    private final PivotFutureProofScoreRepository scoreRepository;
    private final FutureProofScoreEventRepository eventRepository;
    private final TransitionProfileRepository transitionProfileRepository;

    @Transactional
    public FutureProofScoreResponse recordFromRoleMatches(TransitionProfile profile,
                                                          List<PivotRoleMatch> matches,
                                                          ScoreTriggerType triggerType,
                                                          String payload) {
        double averageMatch = matches == null || matches.isEmpty()
            ? 50d
            : matches.stream()
                .map(PivotRoleMatch::getMatchScore)
                .filter(score -> score != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(50d);

        double overall = clamp(averageMatch + 10d);
        double adaptability = clamp(overall - 5d);
        double skillRelevance = clamp(averageMatch + 5d);
        double marketDemand = clamp(overall);
        double stability = clamp(55d + (matches != null ? matches.size() * 2d : 0d));

        UUID eventId = UUID.randomUUID();
        FutureProofScoreEvent event = FutureProofScoreEvent.builder()
            .eventId(eventId)
            .profile(profile)
            .triggerType(triggerType)
            .payload(payload)
            .computedScore(overall)
            .createdAt(LocalDateTime.now())
            .build();
        eventRepository.save(event);

        PivotFutureProofScore score = PivotFutureProofScore.builder()
            .profile(profile)
            .overallScore(overall)
            .adaptabilityScore(adaptability)
            .skillRelevanceScore(skillRelevance)
            .marketDemandScore(marketDemand)
            .stabilityScore(stability)
            .sourceEventId(eventId)
            .computedAt(LocalDateTime.now())
            .build();

        PivotFutureProofScore persisted = scoreRepository.save(score);
        return FutureProofScoreResponse.from(persisted);
    }

    @Transactional(readOnly = true)
    public FutureProofScoreResponse getLatestForUser(Long userId) {
        Optional<TransitionProfile> profile = transitionProfileRepository.findByJobseekerId(userId);
        return profile
            .flatMap(scoreRepository::findTopByProfileOrderByComputedAtDesc)
            .map(FutureProofScoreResponse::from)
            .orElse(null);
    }

    private double clamp(double value) {
        return Math.max(0d, Math.min(100d, value));
    }
}

