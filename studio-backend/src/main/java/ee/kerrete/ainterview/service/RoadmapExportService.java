package ee.kerrete.ainterview.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.auth.util.SecurityUtils;
import ee.kerrete.ainterview.dto.RoadmapExportRequest;
import ee.kerrete.ainterview.dto.RoadmapExportResponse;
import ee.kerrete.ainterview.dto.RoadmapTaskDto;
import ee.kerrete.ainterview.dto.SkillPlanDay;
import ee.kerrete.ainterview.dto.SkillPlanRequest;
import ee.kerrete.ainterview.dto.SkillPlanResponse;
import ee.kerrete.ainterview.interview.dto.CandidateSummaryDto;
import ee.kerrete.ainterview.interview.service.CandidateSummaryService;
import ee.kerrete.ainterview.model.InterviewSession;
import ee.kerrete.ainterview.model.InterviewSessionEvent;
import ee.kerrete.ainterview.model.InterviewSessionEventType;
import ee.kerrete.ainterview.repository.InterviewSessionEventRepository;
import ee.kerrete.ainterview.repository.InterviewSessionRepository;
import ee.kerrete.ainterview.repository.RoadmapTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapExportService {

    private final RoadmapTaskRepository roadmapTaskRepository;
    private final RoadmapService roadmapService;
    private final CandidateSummaryService candidateSummaryService;
    private final InterviewSessionRepository interviewSessionRepository;
    private final InterviewSessionEventRepository interviewSessionEventRepository;
    private final SkillPlanService skillPlanService;
    private final ObjectMapper objectMapper;

    public RoadmapExportResponse export(RoadmapExportRequest request) {
        validateRequest(request);

        UUID sessionUuid = request.getSessionUuid();
        InterviewSession session = interviewSessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        String email = SecurityUtils.resolveEmailOrAnonymous();

        List<RoadmapTaskDto> tasks = roadmapService.getTasksForEmail(email);
        if (tasks.isEmpty()) {
            tasks = generateAndPersistPlan(email, request.getTimelineDays(), session);
        }

        RoadmapExportResponse response = RoadmapExportResponse.builder()
                .sessionUuid(sessionUuid)
                .generatedAt(Instant.now().toString())
                .timelineDays(request.getTimelineDays())
                .riskAssessment(buildRiskAssessment(session))
                .topWeaknesses(resolveTopWeaknesses(session))
                .roadmapItems(mapItems(tasks, request.getTimelineDays()))
                .progressPercent(resolveProgressPercent(email))
                .build();

        persistEvent(sessionUuid, request.getFormat(), response);
        return response;
    }

    private void validateRequest(RoadmapExportRequest request) {
        if (request == null || request.getSessionUuid() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sessionUuid is required");
        }
        if (request.getTimelineDays() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "timelineDays is required");
        }
        int days = request.getTimelineDays();
        if (days != 7 && days != 30 && days != 90) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "timelineDays must be 7, 30 or 90");
        }
    }

    private List<RoadmapTaskDto> generateAndPersistPlan(String email, int timelineDays, InterviewSession session) {
        SkillPlanRequest planRequest = new SkillPlanRequest();
        planRequest.setEmail(email);
        planRequest.setJobMatcherSummary(session.getRole());
        planRequest.setFocusSkills(deriveFocusSkills(session));

        SkillPlanResponse plan = skillPlanService.buildPlan(planRequest);
        if (plan == null || CollectionUtils.isEmpty(plan.getDays())) {
            return List.of();
        }

        List<RoadmapTaskDto> tasks = new ArrayList<>();
        for (SkillPlanDay day : plan.getDays()) {
            if (day == null) continue;
            if (day.getDayNumber() > timelineDays) {
                continue;
            }
            tasks.add(RoadmapTaskDto.builder()
                    .taskKey("day-" + day.getDayNumber())
                    .title(defaultTitle(day))
                    .description(buildDescription(day))
                    .completed(false)
                    .dayNumber(day.getDayNumber())
                    .build());
        }

        roadmapService.savePlan(email, session.getRole(), tasks);
        return roadmapService.getTasksForEmail(email);
    }

    private List<String> deriveFocusSkills(InterviewSession session) {
        List<String> focus = new ArrayList<>();
        if (StringUtils.hasText(session.getRole())) {
            focus.add(session.getRole());
        }
        if (StringUtils.hasText(session.getCompany())) {
            focus.add(session.getCompany());
        }
        return focus.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .limit(3)
                .toList();
    }

    private String defaultTitle(SkillPlanDay day) {
        if (StringUtils.hasText(day.getTitle())) {
            return day.getTitle();
        }
        return "Day " + day.getDayNumber();
    }

    private String buildDescription(SkillPlanDay day) {
        List<String> parts = new ArrayList<>();
        if (StringUtils.hasText(day.getDescription())) {
            parts.add(day.getDescription().trim());
        }
        if (StringUtils.hasText(day.getPracticeTask())) {
            parts.add("Practice: " + day.getPracticeTask().trim());
        }
        return String.join(" | ", parts);
    }

    private RoadmapExportResponse.RiskAssessment buildRiskAssessment(InterviewSession session) {
        CandidateSummaryDto summary = candidateSummaryService.loadFromSession(session);
        String band = summary.getBand() == null ? "UNKNOWN" : summary.getBand();

        int riskPercent = switch (band.toUpperCase()) {
            case "STRONG" -> 18;
            case "SOLID" -> 30;
            case "EMERGING" -> 48;
            case "FOUNDATIONAL" -> 62;
            default -> 50;
        };

        double confidence = computeConfidence(summary);

        return RoadmapExportResponse.RiskAssessment.builder()
                .band(band)
                .riskPercent(riskPercent)
                .confidence(confidence)
                .build();
    }

    private double computeConfidence(CandidateSummaryDto summary) {
        int answered = summary.getAnsweredCount();
        int signals = summary.getSignals() == null ? 0 : summary.getSignals().size();
        double base = 0.25 + Math.min(1.0, (answered + signals) / 10.0);
        return Math.max(0.2, Math.min(1.0, base));
    }

    private List<String> resolveTopWeaknesses(InterviewSession session) {
        CandidateSummaryDto summary = candidateSummaryService.loadFromSession(session);
        List<String> growth = summary.getGrowthAreas();
        if (CollectionUtils.isEmpty(growth)) {
            return List.of();
        }
        return growth.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .limit(3)
                .toList();
    }

    private List<RoadmapExportResponse.RoadmapItem> mapItems(List<RoadmapTaskDto> tasks, int timelineDays) {
        if (CollectionUtils.isEmpty(tasks)) {
            return List.of();
        }
        AtomicInteger fallbackDay = new AtomicInteger(1);
        return tasks.stream()
                .filter(t -> t.getDayNumber() == null || t.getDayNumber() <= timelineDays)
                .sorted(Comparator.comparing((RoadmapTaskDto t) -> t.getDayNumber() != null ? t.getDayNumber() : Integer.MAX_VALUE)
                        .thenComparing(RoadmapTaskDto::getTaskKey))
                .map(task -> {
                    int day = task.getDayNumber() != null ? task.getDayNumber() : fallbackDay.getAndIncrement();
                    String title = StringUtils.hasText(task.getTitle()) ? task.getTitle() : "Day " + day;
                    List<String> taskList = new ArrayList<>();
                    if (StringUtils.hasText(task.getDescription())) {
                        taskList.add(task.getDescription());
                    }
                    String checkpoint = "Share a short update for " + title;
                    return RoadmapExportResponse.RoadmapItem.builder()
                            .day(day)
                            .title(title)
                            .tasks(taskList)
                            .checkpoint(checkpoint)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private int resolveProgressPercent(String email) {
        long total = roadmapTaskRepository.countByEmail(email);
        long completed = roadmapTaskRepository.countByEmailAndCompletedIsTrue(email);
        if (total == 0) {
            return 0;
        }
        return (int) Math.round(completed * 100.0 / total);
    }

    private void persistEvent(UUID sessionUuid, RoadmapExportRequest.Format format, RoadmapExportResponse response) {
        try {
            Map<String, Object> payload = Map.of(
                    "format", format == null ? RoadmapExportRequest.Format.JSON : format,
                    "generatedAt", response.getGeneratedAt(),
                    "timelineDays", response.getTimelineDays(),
                    "progressPercent", response.getProgressPercent()
            );

            InterviewSessionEvent event = InterviewSessionEvent.builder()
                    .sessionUuid(sessionUuid)
                    .eventType(InterviewSessionEventType.ROADMAP_EXPORTED)
                    .payloadJson(objectMapper.writeValueAsString(payload))
                    .build();
            interviewSessionEventRepository.save(Objects.requireNonNull(event));
        } catch (Exception e) {
            log.warn("Failed to persist roadmap export event for session {}", sessionUuid, e);
        }
    }
}

