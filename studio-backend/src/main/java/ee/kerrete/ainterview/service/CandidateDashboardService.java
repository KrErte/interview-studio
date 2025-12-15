package ee.kerrete.ainterview.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.auth.util.SecurityUtils;
import ee.kerrete.ainterview.career.dto.FutureProofScoreDto;
import ee.kerrete.ainterview.career.dto.RoleMatchDto;
import ee.kerrete.ainterview.career.dto.SkillProfileDto;
import ee.kerrete.ainterview.career.model.FutureProofScore;
import ee.kerrete.ainterview.career.model.RoleMatch;
import ee.kerrete.ainterview.career.model.RoleProfile;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.FutureProofScoreRepository;
import ee.kerrete.ainterview.career.repository.RoleMatchRepository;
import ee.kerrete.ainterview.career.repository.RoleProfileRepository;
import ee.kerrete.ainterview.career.service.SkillProfileService;
import ee.kerrete.ainterview.dto.CvSummaryDto;
import ee.kerrete.ainterview.dto.dashboard.DashboardJobAnalysisDto;
import ee.kerrete.ainterview.dto.dashboard.DashboardResponse;
import ee.kerrete.ainterview.dto.dashboard.DashboardTrainingDto;
import ee.kerrete.ainterview.model.JobAnalysisSession;
import ee.kerrete.ainterview.model.TrainingProgress;
import ee.kerrete.ainterview.repository.JobAnalysisSessionRepository;
import ee.kerrete.ainterview.repository.TrainingProgressRepository;
import ee.kerrete.ainterview.repository.TrainingTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateDashboardService {

    private final CvSummaryService cvSummaryService;
    private final SkillProfileService skillProfileService;
    private final RoleMatchRepository roleMatchRepository;
    private final FutureProofScoreRepository futureProofScoreRepository;
    private final RoleProfileRepository roleProfileRepository;
    private final TrainingTaskRepository trainingTaskRepository;
    private final TrainingProgressRepository trainingProgressRepository;
    private final JobAnalysisSessionRepository jobAnalysisSessionRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String requestEmail) {
        String email = SecurityUtils.resolveEmailOrAnonymous(requestEmail);

        CvSummaryDto cvSummary = cvSummaryService.findByEmail(email)
            .orElseGet(() -> CvSummaryDto.builder()
                .email(email)
                .headline("")
                .parsedSkills(List.of())
                .experienceSummary("")
                .rawText("")
                .build());

        SkillProfile skillProfile = skillProfileService.findByEmail(email).orElse(null);
        SkillProfileDto skillProfileDto = skillProfile != null
            ? skillProfileService.toDto(skillProfile)
            : SkillProfileDto.builder()
                .id(null)
                .email(email)
                .roleFamily("")
                .location("")
                .yearsExperience(null)
                .skills(List.of())
                .visibility(null)
                .futureProofScore(null)
                .build();

        List<RoleMatchDto> matches = skillProfile == null
            ? List.of()
            : mapRoleMatches(skillProfile.getId());

        List<FutureProofScoreDto> scores = skillProfile == null
            ? List.of()
            : mapFutureProofScores(skillProfile.getId());

        DashboardTrainingDto training = buildTraining(email);
        List<DashboardJobAnalysisDto> analyses = mapJobAnalyses(email);

        return DashboardResponse.builder()
            .email(email)
            .cvSummary(cvSummary)
            .skillProfile(skillProfileDto)
            .recentRoleMatches(matches)
            .futureProofScores(scores)
            .training(training)
            .jobAnalyses(analyses)
            .build();
    }

    private List<RoleMatchDto> mapRoleMatches(Long skillProfileId) {
        List<RoleMatch> entities = roleMatchRepository.findTop10BySkillProfileIdOrderByOverlapPercentDesc(skillProfileId);
        return entities.stream()
            .map(this::toRoleMatchDto)
            .collect(Collectors.toList());
    }

    private RoleMatchDto toRoleMatchDto(RoleMatch match) {
        RoleProfile roleProfile = roleProfileRepository.findById(match.getRoleProfileId()).orElse(null);
        String roleName = roleProfile != null && StringUtils.hasText(roleProfile.getRoleName())
            ? roleProfile.getRoleName()
            : "Unknown role";
        String roleFamily = roleProfile != null && StringUtils.hasText(roleProfile.getRoleFamily())
            ? roleProfile.getRoleFamily()
            : "Unknown";
        List<String> gaps = parseList(match.getGapSkillsJson());

        return RoleMatchDto.builder()
            .roleProfileId(match.getRoleProfileId())
            .roleName(roleName)
            .roleFamily(roleFamily)
            .overlapPercent(match.getOverlapPercent())
            .gapSkills(gaps)
            .estimatedWeeks(match.getEstimatedWeeks())
            .source("career-engine")
            .build();
    }

    private List<FutureProofScoreDto> mapFutureProofScores(Long skillProfileId) {
        List<FutureProofScore> entities = futureProofScoreRepository.findTop5BySkillProfileIdOrderByCreatedAtDesc(skillProfileId);
        return entities.stream()
            .map(score -> FutureProofScoreDto.builder()
                .skillProfileId(score.getSkillProfileId())
                .score(score.getScore())
                .explainJson(score.getExplainJson())
                .computedAt(score.getCreatedAt() != null ? score.getCreatedAt() : java.time.LocalDateTime.now())
                .build())
            .collect(Collectors.toList());
    }

    private DashboardTrainingDto buildTraining(String email) {
        long totalTasks = trainingTaskRepository.countByEmail(email);
        long completed = trainingTaskRepository.countByEmailAndCompletedIsTrue(email);
        TrainingProgress progress = trainingProgressRepository.findByEmail(email).orElse(null);
        Integer percent = progress != null ? progress.getTrainingProgressPercent() : null;
        String status = progress != null && progress.getStatus() != null ? progress.getStatus().name() : "NOT_STARTED";

        return DashboardTrainingDto.builder()
            .totalTasks(totalTasks)
            .completedTasks(completed)
            .progressPercent(percent)
            .status(status)
            .build();
    }

    private List<DashboardJobAnalysisDto> mapJobAnalyses(String email) {
        List<JobAnalysisSession> sessions = jobAnalysisSessionRepository.findTop10ByEmailOrderByCreatedAtDesc(email);
        return sessions.stream()
            .map(session -> DashboardJobAnalysisDto.builder()
                .id(session.getId())
                .jobTitle(Optional.ofNullable(session.getJobTitle()).orElse(""))
                .matchScore(session.getMatchScore())
                .summary(Optional.ofNullable(session.getSummary()).orElse(""))
                .createdAt(Optional.ofNullable(session.getCreatedAt()).orElse(java.time.LocalDateTime.now()))
                .build())
            .collect(Collectors.toList());
    }

    private List<String> parseList(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}

