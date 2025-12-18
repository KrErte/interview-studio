package ee.kerrete.ainterview.risk.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.dto.ObserverLogCreateCommand;
import ee.kerrete.ainterview.interview.dto.InterviewProfileDto;
import ee.kerrete.ainterview.interview.service.InterviewProfileService;
import ee.kerrete.ainterview.model.ObserverStage;
import ee.kerrete.ainterview.model.TrainingTask;
import ee.kerrete.ainterview.repository.TrainingTaskRepository;
import ee.kerrete.ainterview.risk.dto.AnalyzeRequest;
import ee.kerrete.ainterview.risk.dto.AnalyzeResponse;
import ee.kerrete.ainterview.risk.dto.RefineRequest;
import ee.kerrete.ainterview.risk.dto.RefineResponse;
import ee.kerrete.ainterview.risk.service.ReplaceabilityRiskService;
import ee.kerrete.ainterview.risk.service.MockRiskService;
import ee.kerrete.ainterview.service.ObserverLogService;
import ee.kerrete.ainterview.support.SessionIdParser;
import ee.kerrete.ainterview.support.SessionIdParser.SessionIdentifier;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.annotation.JsonAlias;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final ReplaceabilityRiskService service;
    private final MockRiskService mockRiskService;
    private final InterviewProfileService interviewProfileService;
    private final TrainingTaskRepository trainingTaskRepository;
    private final ObserverLogService observerLogService;
    private final ObjectMapper objectMapper;
    private final SessionIdParser sessionIdParser;

    @PostMapping("/analyze")
    public AnalyzeResponse analyze(@RequestBody AnalyzeRequest request) {
        SessionIdentifier session = sessionIdParser.parseOptional(request.getSessionId());
        AnalyzeResponse response = service.analyze(request);
        recordInitialAssessment(session, response);
        return response;
    }

    @PostMapping("/refine")
    public RefineResponse refine(@RequestBody RefineRequest request) {
        SessionIdentifier session = sessionIdParser.parseOptional(request.getSessionId());
        RefineResponse response = service.refine(request);
        recordReassessment(session, response);
        recordRoadmapGenerated(session, response);
        return response;
    }

    @GetMapping("/questions")
    public QuestionsResponse questions() {
        // Lightweight stub list for public consumption
        return new QuestionsResponse(List.of(
            "Which parts of your job rely most on human judgment?",
            "How often do you use AI tools in your daily work?",
            "What tasks would be hardest to automate in your role?"
        ));
    }

    @GetMapping("/summary")
    public RiskSummaryResponse summary(@RequestParam(value = "sessionId", required = false) String sessionId,
                                       @RequestParam(value = "sessionUuid", required = false) String sessionUuidAlias) {
        String raw = StringUtils.hasText(sessionId) ? sessionId : sessionUuidAlias;
        SessionIdentifier session = sessionIdParser.parseOptional(raw);
        if (session.mock()) {
            return mockRiskService.summary(session.raw());
        }

        int riskScore = 37;
        String band = "MEDIUM";
        String message = "Heuristic risk snapshot";

        List<String> missingSignals = new ArrayList<>();
        if (session.hasUuid()) {
            InterviewProfileDto profile = loadProfile(session);
            if (profile != null) {
                missingSignals.addAll(safe(profile.getInterviewerProbePriorities()));
            } else {
                missingSignals.add("profile_not_found");
            }
        } else {
            missingSignals.add("session_missing");
        }

        if (missingSignals.isEmpty()) {
            missingSignals.add("insufficient_signals");
        }

        double confidence = computeConfidence(missingSignals.size());

        return new RiskSummaryResponse(riskScore, band, message, confidence, dedupe(missingSignals));
    }

    @PostMapping("/re-evaluate")
    public ResponseEntity<RiskSummaryResponse> reEvaluate(
            @RequestBody(required = false) ReEvaluateRequest req
    ) {
        String email = req != null ? trim(req.getEmail()) : null;
        String taskKey = req != null ? trim(req.getTaskKey()) : null;
        if (!StringUtils.hasText(email) || !StringUtils.hasText(taskKey)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email and taskKey are required");
        }

        TrainingTask task = trainingTaskRepository.findByEmailAndTaskKey(email, taskKey)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Training session not found for email and taskKey"));

        List<String> answers = readAnswers(task);
        int riskScore = 37;
        String band = "MEDIUM";
        String message = "Session-based risk snapshot";

        List<String> missingSignals = new ArrayList<>();
        SessionIdentifier session = sessionIdParser.parseOptional(req != null ? req.getSessionId() : null);
        if (session.hasUuid()) {
            InterviewProfileDto profile = loadProfile(session);
            if (profile != null) {
                missingSignals.addAll(safe(profile.getInterviewerProbePriorities()));
            } else {
                missingSignals.add("profile_not_found");
            }
        }
        if (answers.isEmpty()) {
            missingSignals.add("answers_missing");
        }

        if (missingSignals.isEmpty()) {
            missingSignals.add("insufficient_signals");
        }

        double confidence = computeConfidence(missingSignals.size());

        return ResponseEntity.ok(new RiskSummaryResponse(riskScore, band, message, confidence, dedupe(missingSignals)));
    }

    private InterviewProfileDto loadProfile(SessionIdentifier session) {
        if (!session.hasUuid()) {
            return null;
        }
        try {
            return interviewProfileService.loadProfile(session.uuid());
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> safe(List<String> list) {
        return list == null ? List.of() : list;
    }

    private List<String> dedupe(List<String> list) {
        return new ArrayList<>(new LinkedHashSet<>(list));
    }

    private double computeConfidence(int missingCount) {
        double c = 1.0 - (missingCount * 0.1);
        return Math.max(0.2, Math.min(1.0, c));
    }

    private List<String> readAnswers(TrainingTask task) {
        if (task == null || !StringUtils.hasText(task.getAnswer())) {
            return List.of();
        }
        return List.of(task.getAnswer().trim());
    }

    private void recordInitialAssessment(SessionIdentifier session, AnalyzeResponse response) {
        if (response == null || !session.hasUuid()) {
            return;
        }
        observerLogService.record(ObserverLogCreateCommand.builder()
                .sessionUuid(session.uuid())
                .stage(ObserverStage.INITIAL_ASSESSMENT)
                .riskAfter(response.getReplaceabilityPct())
                .confidenceAfter(confidenceScore(response.getConfidence()))
                .weaknessesJson(writeJsonArray(response.getRisks()))
                .signalsJson(writeJsonArray(response.getStrengths()))
                .rationaleSummary(buildRationaleSummary(null, response.getReplaceabilityPct(), response.getRisks(), response.getStrengths()))
                .build());
    }

    private void recordReassessment(SessionIdentifier session, RefineResponse response) {
        if (response == null || !session.hasUuid()) {
            return;
        }
        Integer riskAfter = response.getReplaceabilityPct();
        Integer riskBefore = response.getDeltaPct() != 0 ? riskAfter - response.getDeltaPct() : null;
        Integer confidenceAfter = confidenceScore(response.getConfidence());

        observerLogService.record(ObserverLogCreateCommand.builder()
                .sessionUuid(session.uuid())
                .stage(ObserverStage.REASSESSMENT)
                .riskBefore(riskBefore)
                .riskAfter(riskAfter)
                .confidenceAfter(confidenceAfter)
                .weaknessesJson(writeJsonArray(response.getRisks()))
                .signalsJson(writeJsonArray(response.getStrengths()))
                .rationaleSummary(buildRationaleSummary(riskBefore, riskAfter, response.getRisks(), response.getStrengths()))
                .build());
    }

    private void recordRoadmapGenerated(SessionIdentifier session, RefineResponse response) {
        if (response == null || !session.hasUuid() || response.getRoadmap() == null) {
            return;
        }
        observerLogService.record(ObserverLogCreateCommand.builder()
                .sessionUuid(session.uuid())
                .stage(ObserverStage.ROADMAP_GENERATED)
                .riskAfter(response.getReplaceabilityPct())
                .confidenceAfter(confidenceScore(response.getConfidence()))
                .weaknessesJson(writeJsonArray(response.getRisks()))
                .signalsJson(writeJsonArray(response.getStrengths()))
                .rationaleSummary(buildRoadmapRationale(response))
                .build());
    }

    private Integer confidenceScore(String confidence) {
        if (confidence == null) return null;
        String c = confidence.trim().toUpperCase();
        return switch (c) {
            case "HIGH" -> 85;
            case "MEDIUM" -> 65;
            case "LOW" -> 45;
            default -> null;
        };
    }

    private String writeJsonArray(List<String> items) {
        if (items == null || items.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            return null;
        }
    }

    private String buildRationaleSummary(Integer before, Integer after, List<String> risks, List<String> strengths) {
        StringBuilder sb = new StringBuilder();
        if (after != null) {
            sb.append("Risk assessed at ").append(after).append("%.");
            if (before != null) {
                sb.append(" Previously ").append(before).append("%.");
            }
        } else {
            sb.append("Risk assessed.");
        }
        if (risks != null && !risks.isEmpty()) {
            sb.append(" Key risks: ").append(String.join("; ", risks.stream().limit(3).toList())).append(".");
        }
        if (strengths != null && !strengths.isEmpty()) {
            sb.append(" Signals: ").append(String.join("; ", strengths.stream().limit(3).toList())).append(".");
        }
        String out = sb.toString();
        return out.length() > 600 ? out.substring(0, 600) : out;
    }

    private String buildRoadmapRationale(RefineResponse response) {
        StringBuilder sb = new StringBuilder("Roadmap generated after reassessment.");
        if (response.getRoadmap() != null && response.getRoadmap().getItems() != null && !response.getRoadmap().getItems().isEmpty()) {
            sb.append(" First items: ");
            sb.append(response.getRoadmap().getItems().stream()
                    .limit(2)
                    .map(i -> i.getTitle() == null ? "Task" : i.getTitle())
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("N/A"));
            sb.append(".");
        }
        String out = sb.toString();
        return out.length() > 600 ? out.substring(0, 600) : out;
    }

    public record RiskSummaryResponse(int riskScore, String band, String message, double confidence, List<String> missingSignals) {}

    public record QuestionsResponse(List<String> questions) {}

    public static class ReEvaluateRequest {
        private String email;
        private String taskKey;
        @JsonAlias("sessionUuid")
        private String sessionId;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getTaskKey() {
            return taskKey;
        }

        public void setTaskKey(String taskKey) {
            this.taskKey = taskKey;
        }

        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
