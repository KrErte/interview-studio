package ee.kerrete.ainterview.pivot.service;

import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.pivot.dto.ComputeRoleMatchesRequest;
import ee.kerrete.ainterview.pivot.dto.ComputeRoleMatchesResponse;
import ee.kerrete.ainterview.pivot.dto.FutureProofScoreResponse;
import ee.kerrete.ainterview.pivot.dto.PivotRoleMatchDto;
import ee.kerrete.ainterview.pivot.entity.PivotRoleMatch;
import ee.kerrete.ainterview.pivot.entity.TransitionProfile;
import ee.kerrete.ainterview.pivot.enums.ScoreTriggerType;
import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import ee.kerrete.ainterview.pivot.repository.PivotRoleMatchRepository;
import ee.kerrete.ainterview.pivot.repository.TransitionProfileRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("pivotRoleMatchService")
@RequiredArgsConstructor
public class PivotRoleMatchService {

    private final TransitionProfileRepository transitionProfileRepository;
    private final PivotRoleMatchRepository roleMatchRepository;
    @Qualifier("pivotFutureProofScoreService")
    private final PivotFutureProofScoreService futureProofScoreService;
    private final EntityManager entityManager;

    @Transactional
    public ComputeRoleMatchesResponse compute(Long userId, ComputeRoleMatchesRequest request) {
        TransitionProfile profile = transitionProfileRepository.findByJobseekerId(userId)
            .orElseGet(() -> TransitionProfile.builder()
                .jobseeker(referenceUser(userId))
                .visibility(VisibilityLevel.ANON)
                .build());

        profile.setCurrentRole(request.getCurrentRole());
        profile.setTargetRole(String.join(", ", request.getTargetRoles()));
        profile.setSkillsJson(request.getSkillsJson());
        profile.setPreferredLocations(request.getPreferredLocations());
        profile.setSummary(request.getJobDescription());
        profile.setExperienceYears(request.getExperienceYears());
        transitionProfileRepository.save(profile);

        UUID requestId = UUID.randomUUID();
        LocalDateTime computedAt = LocalDateTime.now();
        List<PivotRoleMatch> matches = request.getTargetRoles().stream()
            .map(targetRole -> PivotRoleMatch.builder()
                .profile(profile)
                .targetRole(targetRole)
                .matchScore(calculateMatchScore(profile, targetRole, request.getJobDescription()))
                .gapSummary(buildGapSummary(request.getJobDescription()))
                .recommendedActions(buildActionPlan(request.getJobDescription()))
                .computedAt(computedAt)
                .futureProofScore(null)
                .requestId(requestId)
                .build())
            .collect(Collectors.toList());

        List<PivotRoleMatch> saved = roleMatchRepository.saveAll(matches);
        FutureProofScoreResponse score = futureProofScoreService.recordFromRoleMatches(
            profile, saved, ScoreTriggerType.ROLE_MATCH_COMPUTE, request.getJobDescription()
        );

        List<PivotRoleMatchDto> result = saved.stream()
            .map(entity -> {
                entity.setFutureProofScore(score.getOverallScore());
                return PivotRoleMatchDto.from(entity);
            })
            .collect(Collectors.toList());

        return ComputeRoleMatchesResponse.from(result, score);
    }

    @Transactional(readOnly = true)
    public List<PivotRoleMatchDto> getForUser(Long userId) {
        return transitionProfileRepository.findByJobseekerId(userId)
            .map(profile -> roleMatchRepository.findByProfileIdOrderByComputedAtDesc(profile.getId()))
            .orElse(List.of())
            .stream()
            .map(PivotRoleMatchDto::from)
            .collect(Collectors.toList());
    }

    private AppUser referenceUser(Long userId) {
        return entityManager.getReference(AppUser.class, userId);
    }

    private double calculateMatchScore(TransitionProfile profile, String targetRole, String jobDescription) {
        double base = 65d;
        if (profile.getExperienceYears() != null) {
            base += Math.min(profile.getExperienceYears(), 10) * 1.5d;
        }
        if (jobDescription != null) {
            base += Math.min(jobDescription.length() / 200d, 10d);
        }
        if (targetRole != null && profile.getCurrentRole() != null &&
            targetRole.toLowerCase().contains(profile.getCurrentRole().toLowerCase())) {
            base += 10d;
        }
        return Math.max(40d, Math.min(95d, base));
    }

    private String buildGapSummary(String jobDescription) {
        if (jobDescription == null || jobDescription.isBlank()) {
            return "Baseline gaps derived from existing skills and target role.";
        }
        return "Derived from job description: " + jobDescription.substring(0, Math.min(180, jobDescription.length()));
    }

    private String buildActionPlan(String jobDescription) {
        if (jobDescription == null || jobDescription.isBlank()) {
            return "Refresh portfolio, align accomplishments to the target role, and request a mock interview.";
        }
        return "Focus on top requirements from JD and run a mock interview to close gaps.";
    }
}


