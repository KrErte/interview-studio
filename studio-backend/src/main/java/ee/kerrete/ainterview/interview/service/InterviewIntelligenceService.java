package ee.kerrete.ainterview.interview.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.interview.dto.CandidateSummaryDto;
import ee.kerrete.ainterview.interview.dto.InterviewIntelligenceResponseDto;
import ee.kerrete.ainterview.interview.dto.InterviewProfileDto;
import ee.kerrete.ainterview.interview.dto.InterviewNextQuestionRequestDto;
import ee.kerrete.ainterview.model.InterviewSession;
import ee.kerrete.ainterview.model.InterviewSessionEventType;
import ee.kerrete.ainterview.repository.InterviewSessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Deterministic interview flow with persisted questionCount / asked IDs to avoid
 * repeating the opening question.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewIntelligenceService {

    private final InterviewSessionRepository interviewSessionRepository;
    private final CandidateSummaryService candidateSummaryService;
    private final InterviewAuditService interviewAuditService;
    private final InterviewProfileService interviewProfileService;
    private final ToneAnalyzerService toneAnalyzerService;
    private final AffectAnalyzerService affectAnalyzerService;
    private final ObjectMapper objectMapper;
    private ObjectMapper lenientMapper;

    private QuestionBank bank;

    @jakarta.annotation.PostConstruct
    void initMapper() {
        lenientMapper = objectMapper.copy()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Transactional
    public InterviewIntelligenceResponseDto nextQuestion(UUID sessionUuid, InterviewNextQuestionRequestDto request) {
        ensureMapper();
        if (sessionUuid == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid session UUID format");
        }
        InterviewSession session = interviewSessionRepository.findBySessionUuid(sessionUuid)
            .orElseThrow(() -> new EntityNotFoundException("Interview session not found: " + sessionUuid));

        List<QaEntry> qa = readQa(session.getQuestionAnswers());
        List<Double> scores = readScores(session.getQuestionAnswers());
        Set<String> askedIds = readAskedIds(session.getAskedQuestionIds());
        CandidateSummaryDto candidateSummary = candidateSummaryService.loadFromSession(session);
        InterviewProfileDto interviewProfile = interviewProfileService.loadProfile(sessionUuid);

        int questionCount = Optional.ofNullable(session.getQuestionCount()).orElse(qa.size());
        questionCount = Math.max(questionCount, qa.size());
        int answered = scores.size();
        boolean firstQuestion = questionCount == 0 || qa.isEmpty();

        String trimmedAnswer = request == null ? null : request.answer();
        trimmedAnswer = trimmedAnswer == null ? null : trimmedAnswer.trim();

        if (trimmedAnswer == null || trimmedAnswer.isBlank()) {
            if (!firstQuestion) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer required for next question.");
            }
        } else {
            if (qa.isEmpty()) {
                if (session.getCurrentQuestionId() == null || session.getCurrentQuestionText() == null) {
                    log.debug("submitAnswer called with no active question for session {} (id={} currentQuestionId={} questionCount={} askedSize={})",
                        sessionUuid, session.getId(), session.getCurrentQuestionId(), session.getQuestionCount(), askedIds.size());
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No question to answer yet; request next question first.");
                }
                qa.add(new QaEntry(session.getCurrentQuestionId(), session.getCurrentQuestionText(), null));
            }
            QaEntry last = qa.get(qa.size() - 1);
            if (last.getAnswer() == null) {
                last.setAnswer(trimmedAnswer);
            }
            updateAnswerBuffers(session, trimmedAnswer);
            scores.add(score(trimmedAnswer));
        }
        questionCount = Math.max(questionCount, qa.size());
        answered = scores.size();

        String decision = questionCount == 0 ? "opening" : "probe";

        double last1 = averageLast(scores, 1);
        double last3 = averageLast(scores, 3);
        double last5 = averageLast(scores, 5);
        FitBlock fit = computeFit(answered, last1, last3, last5);

        if (trimmedAnswer != null && !trimmedAnswer.isBlank() && !qa.isEmpty()) {
            QaEntry lastAnswered = qa.get(qa.size() - 1);

            ToneAnalyzerService.ToneResult toneResult = toneAnalyzerService.analyze(trimmedAnswer);
            AffectAnalyzerService.AffectResult affectResult = affectAnalyzerService.analyze(trimmedAnswer, toneResult);

            candidateSummary = candidateSummaryService.recordTurn(
                session,
                lastAnswered.getQuestionId(),
                lastAnswered.getQuestion(),
                trimmedAnswer,
                decision,
                fit.fitScore,
                fit.fitTrend,
                session.getCurrentDimension(),
                answered,
                last3
            );

            Map<String, Object> answerEvent = new java.util.LinkedHashMap<>();
            answerEvent.put("questionId", lastAnswered.getQuestionId());
            answerEvent.put("question", lastAnswered.getQuestion());
            answerEvent.put("answer", trimmedAnswer);
            answerEvent.put("answerShort", trimmedAnswer.length() <= 120 ? trimmedAnswer : trimmedAnswer.substring(0, 117) + "...");
            answerEvent.put("decision", decision);
            answerEvent.put("fitScore", fit.fitScore);
            answerEvent.put("fitTrend", fit.fitTrend);
            answerEvent.put("currentDimension", session.getCurrentDimension());
            answerEvent.put("style", session.getInterviewerStyle() == null ? null : session.getInterviewerStyle().name());
            answerEvent.put("questionCount", questionCount);
            answerEvent.put("probeCount", session.getProbeCount());
            interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.ANSWER_RECORDED, answerEvent);

            Map<String, Object> toneEvent = new java.util.LinkedHashMap<>();
            toneEvent.put("tone", toneResult.tone());
            toneEvent.put("reason", toneResult.reason());
            toneEvent.put("intensity", toneResult.intensity());
            toneEvent.put("affect", affectResult.affect());
            toneEvent.put("affectReason", affectResult.reason());
            interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.TONE_DETECTED, toneEvent);

            Map<String, Object> summaryEvent = Map.of(
                "candidateSummary", candidateSummary
            );
            interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.SUMMARY_UPDATED, summaryEvent);
        }

        Selection selection = selectQuestion(decision, askedIds, questionCount, answered, interviewProfile);
        Question pick = selection == null ? null : selection.question();
        if (pick == null) {
        InterviewIntelligenceResponseDto.Progress progress = progress(questionCount, last1, last3, last5, session.getCurrentDimension());
            InterviewIntelligenceResponseDto.FitBreakdown breakdown = buildBreakdown(answered, fit, last3, last5);
            session.setCurrentQuestionId(null);
            session.setCurrentQuestionText(null);
            session.setQuestionCount(questionCount);
            session.setQuestionAnswers(writeQa(qa));
            session.setAskedQuestionIds(writeAskedIds(askedIds));
            interviewSessionRepository.save(session);
            interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.DECISION_MADE,
                decisionPayload("complete", "no_available_question", session, null, questionCount, answered, fit, last1, last3, last5, progress, null));
            return InterviewIntelligenceResponseDto.builder()
                .question(null)
                .decision("complete")
                .fitScore(fit.fitScore)
                .fitTrend(fit.fitTrend)
                .progress(progress)
                .fit(fit.toDto(progress.getCurrentDimension(), fit.fitTrend))
                .fitBreakdown(breakdown)
                .candidateSummary(candidateSummary)
                .sessionComplete(true)
                .build();
        }

        // Mark served: add QA entry, increment questionCount, persist
        qa.add(new QaEntry(pick.id(), pick.text(), null));
        askedIds.add(pick.id());
        questionCount += 1;
        session.setCurrentQuestionId(pick.id());
        session.setCurrentQuestionText(pick.text());
        // Set current dimension only when not intro
        if (!pick.id().startsWith("INTRO_")) {
            String dimKey = pick.id().contains(":") ? pick.id().split(":", 2)[0] : null;
            session.setCurrentDimension(dimKey);
        } else {
            session.setCurrentDimension(null);
        }
        session.setQuestionCount(questionCount);
        session.setQuestionAnswers(writeQa(qa));
        session.setAskedQuestionIds(writeAskedIds(askedIds));
        session.setCreatedAt(Optional.ofNullable(session.getCreatedAt()).orElse(LocalDateTime.now()));

        interviewSessionRepository.save(session);

        InterviewIntelligenceResponseDto.Progress progress = progress(questionCount, last1, last3, last5, session.getCurrentDimension());
        InterviewIntelligenceResponseDto.FitBreakdown breakdown = buildBreakdown(answered, fit, last3, last5);
        interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.DECISION_MADE,
            decisionPayload(decision, "next_question_selected", session, pick, questionCount, answered, fit, last1, last3, last5, progress, selection));
        if (selection != null && selection.profileDimensionUsed() != null) {
            interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.CV_REFERENCE_USED, Map.of(
                "dimension", selection.profileDimensionUsed(),
                "decision", decision
            ));
        }

        return InterviewIntelligenceResponseDto.builder()
            .question(pick.text())
            .decision(decision)
            .fitScore(fit.fitScore)
            .fitTrend(fit.fitTrend)
            .progress(progress)
            .fit(fit.toDto(progress.getCurrentDimension(), fit.fitTrend))
            .fitBreakdown(breakdown)
            .candidateSummary(candidateSummary)
            .sessionComplete(false)
            .build();
    }

    private InterviewIntelligenceResponseDto.Progress progress(int qCount, double last1, double last3, double last5, String currentDimension) {
        return InterviewIntelligenceResponseDto.Progress.builder()
            .questionCount(qCount)
            .currentDimension(currentDimension)
            .last1Average(last1)
            .last3Average(last3)
            .last5Average(last5)
            .build();
    }

    private void updateAnswerBuffers(InterviewSession session, String answer) {
        session.setLast1Answer(answer);

        List<String> last3 = readStringList(session.getLast3Answers());
        appendCapped(last3, answer, 3);
        session.setLast3Answers(writeStringList(last3));

        List<String> last5 = readStringList(session.getLast5Answers());
        appendCapped(last5, answer, 5);
        session.setLast5Answers(writeStringList(last5));
    }

    private void appendCapped(List<String> list, String value, int cap) {
        list.add(value);
        while (list.size() > cap) {
            list.remove(0);
        }
    }

    private List<String> readStringList(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return lenientMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    private String writeStringList(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (IOException e) {
            return "[]";
        }
    }

    private List<QaEntry> readQa(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return lenientMapper.readValue(json, new TypeReference<List<QaEntry>>() {});
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    private List<Double> readScores(String json) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            List<Map<String, Object>> raw = lenientMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
            List<Double> scores = new ArrayList<>();
            for (Map<String, Object> m : raw) {
                if (m == null) continue;
                if (m.containsKey("avg")) {
                    Object v = m.get("avg");
                    if (v instanceof Number n) {
                        scores.add(n.doubleValue());
                        continue;
                    }
                }
                Object ans = m.get("answer");
                if (ans != null) {
                    scores.add(score(String.valueOf(ans)));
                }
            }
            return scores;
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    private String writeQa(List<QaEntry> qa) {
        try {
            return objectMapper.writeValueAsString(qa == null ? List.of() : qa);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to serialize questionAnswers", e);
        }
    }

    private Selection selectQuestion(String decision, Set<String> askedIds, int questionCount, int answered, InterviewProfileDto profile) {
        // Opening: prefer CV-driven dimension if available
        if ("opening".equals(decision) && questionCount == 0 && answered == 0) {
            List<String> priorities = profile == null || profile.getProbePriorities() == null ? List.of() : profile.getProbePriorities();
            for (String dimKey : priorities) {
                Dimension match = bank().dimensions().stream().filter(d -> d.key().equals(dimKey)).findFirst().orElse(null);
                if (match == null) continue;
                List<String> pool = match.questions().opening();
                for (int i = 0; i < pool.size(); i++) {
                    String qId = match.key() + ":opening:" + i;
                    if (!askedIds.contains(qId)) {
                        return new Selection(new Question(qId, pool.get(i)), dimKey);
                    }
                }
            }
            List<String> intro = bank().intro();
            if (intro == null || intro.isEmpty()) {
                throw new IllegalStateException("No INTRO questions available in bank");
            }
            for (int i = 0; i < intro.size(); i++) {
                String id = "INTRO_" + String.format("%04d", i + 1);
                if (!askedIds.contains(id)) {
                    return new Selection(new Question(id, intro.get(i)), null);
                }
            }
            return null;
        }

        List<Dimension> dimensions = bank().dimensions();
        if (dimensions == null || dimensions.isEmpty()) {
            return null;
        }

        List<Dimension> ordered = orderDimensions(dimensions, profile);
        List<String> types = List.of(decision);
        if (!decision.equals("challenge")) {
            types = List.of(decision, "probe", "challenge", "opening");
        }

        for (String type : types) {
            for (Dimension d : ordered) {
                List<String> pool = poolForType(d.questions(), type);
                for (int i = 0; i < pool.size(); i++) {
                    String qText = pool.get(i);
                    String qId = d.key() + ":" + type + ":" + i;
                    if (!askedIds.contains(qId)) {
                        String usedDim = profile != null && profile.getProbePriorities() != null && profile.getProbePriorities().contains(d.key()) ? d.key() : null;
                        return new Selection(new Question(qId, qText), usedDim);
                    }
                }
            }
        }
        return null;
    }

    private List<Dimension> orderDimensions(List<Dimension> dimensions, InterviewProfileDto profile) {
        if (profile == null || profile.getProbePriorities() == null || profile.getProbePriorities().isEmpty()) {
            return dimensions;
        }
        List<String> priorities = profile.getProbePriorities();
        List<Dimension> ordered = new ArrayList<>();
        Set<String> added = new LinkedHashSet<>();
        for (String p : priorities) {
            dimensions.stream().filter(d -> d.key().equals(p)).findFirst().ifPresent(d -> {
                if (added.add(d.key())) {
                    ordered.add(d);
                }
            });
        }
        for (Dimension d : dimensions) {
            if (added.add(d.key())) {
                ordered.add(d);
            }
        }
        return ordered;
    }

    private List<String> poolForType(Questions q, String type) {
        return switch (type) {
            case "opening" -> q.opening();
            case "challenge" -> q.challenge();
            default -> q.probe();
        };
    }

    private Set<String> readAskedIds(String json) {
        if (json == null || json.isBlank()) {
            return new LinkedHashSet<>();
        }
        try {
            List<String> list = lenientMapper.readValue(json, new TypeReference<List<String>>() {});
            return new LinkedHashSet<>(list);
        } catch (IOException e) {
            return new LinkedHashSet<>();
        }
    }

    private String writeAskedIds(Set<String> asked) {
        try {
            return objectMapper.writeValueAsString(asked == null ? List.of() : new ArrayList<>(asked));
        } catch (IOException e) {
            return "[]";
        }
    }

    private synchronized QuestionBank bank() {
        ensureMapper();
        if (bank == null) {
            bank = loadBank();
        }
        return bank;
    }

    private QuestionBank loadBank() {
        ensureMapper();
        try (var is = getClass().getClassLoader().getResourceAsStream("spec/question-bank-seed-v1.json")) {
            if (is == null) {
                throw new IllegalStateException("question-bank-seed-v1.json not found");
            }
            return lenientMapper.readValue(is, QuestionBank.class);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load question bank", e);
        }
    }

    private double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    private void ensureMapper() {
        if (lenientMapper == null) {
            lenientMapper = objectMapper.copy()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        }
    }

    private double score(String answer) {
        if (answer == null || answer.isBlank()) return 0.0;
        int words = answer.trim().split("\\s+").length;
        double raw = (words / 20.0) * 5.0;
        return clamp(raw, 0.0, 5.0);
    }

    private record Question(String id, String text) {}

    private FitBlock computeFit(int answered, double last1, double last3, double last5) {
        if (answered < 3) {
            return FitBlock.notComputed();
        }

        int fitScore = (int) Math.round(clamp(last3 / 5.0 * 100.0, 0.0, 100.0));
        double delta = answered >= 5 ? last3 - last5 : last1 - last3;
        String trend;
        if (delta >= 0.5) {
            trend = "improving";
        } else if (delta <= -0.5) {
            trend = "declining";
        } else {
            trend = "flat";
        }

        return new FitBlock(true, fitScore, trend, (double) fitScore);
    }

    private InterviewIntelligenceResponseDto.FitBreakdown buildBreakdown(int answered, FitBlock fit, double last3, double last5) {
        if (answered < 3 || !fit.computed) {
            return InterviewIntelligenceResponseDto.FitBreakdown.builder()
                .confidence("LOW")
                .answeredCount(answered)
                .dimensions(List.of())
                .build();
        }

        String confidence;
        double variance = Math.abs(last3 - last5);
        if (answered >= 8 && variance < 0.3) {
            confidence = "HIGH";
        } else if (variance < 0.7) {
            confidence = "MEDIUM";
        } else {
            confidence = "LOW";
        }

        Dimension primary = bank().dimensions().isEmpty() ? null : bank().dimensions().get(0);
        String key = primary == null ? "general" : primary.key();
        String label = primary == null ? "General" : primary.name();

        int scorePercent = fit.fitScore == null ? 0 : fit.fitScore;
        String band = scorePercent >= 80 ? "STRONG" : scorePercent >= 60 ? "GOOD" : "NEEDS_WORK";

        String trendEnum = switch (fit.fitTrend == null ? "STABLE" : fit.fitTrend.toLowerCase()) {
            case "improving" -> "IMPROVING";
            case "declining" -> "DECLINING";
            default -> "STABLE";
        };

        List<InterviewIntelligenceResponseDto.Insight> insights = selectInsights(key, band, trendEnum);

        InterviewIntelligenceResponseDto.DimensionBreakdown dim = InterviewIntelligenceResponseDto.DimensionBreakdown.builder()
            .key(key)
            .label(label)
            .scorePercent(scorePercent)
            .band(band)
            .insights(insights)
            .build();

        return InterviewIntelligenceResponseDto.FitBreakdown.builder()
            .confidence(confidence)
            .answeredCount(answered)
            .dimensions(List.of(dim))
            .build();
    }

    private Map<String, Object> decisionPayload(String decision,
                                                String reason,
                                                InterviewSession session,
                                                Question pick,
                                                int questionCount,
                                                int answered,
                                                FitBlock fit,
                                                double last1,
                                                double last3,
                                                double last5,
                                                InterviewIntelligenceResponseDto.Progress progress,
                                                Selection selection) {
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("message", "Decision engine selected next action");
        payload.put("decision", decision);
        payload.put("reason", reason);
        String currentStyle = session.getInterviewerStyle() == null ? "SYSTEM" : session.getInterviewerStyle().name();
        payload.put("currentStyle", currentStyle);
        payload.put("nextStyle", currentStyle);
        String currentDimension = session.getCurrentDimension() == null ? "UNKNOWN" : session.getCurrentDimension();
        payload.put("currentDimension", currentDimension);
        String nextDimension = currentDimension;
        if (pick != null && pick.id() != null && pick.id().contains(":")) {
            nextDimension = pick.id().split(":", 2)[0];
        }
        payload.put("nextDimension", nextDimension == null ? "UNKNOWN" : nextDimension);
        payload.put("questionId", pick == null ? null : pick.id());
        payload.put("questionText", pick == null ? null : pick.text());
        payload.put("questionCount", questionCount);
        payload.put("probeCount", session.getProbeCount());
        payload.put("fitScore", fit == null ? null : fit.fitScore);
        payload.put("fitTrend", fit == null ? null : fit.fitTrend);
        payload.put("last1Score", last1);
        payload.put("last3Avg", last3);
        payload.put("last5Avg", last5);
        payload.put("sessionComplete", "complete".equals(decision));
        payload.put("profileDimensionUsed", selection == null ? null : selection.profileDimensionUsed());
        payload.put("currentDimensionProgress", progress == null ? null : progress.getCurrentDimension());
        payload.put("answeredCount", answered);
        return payload;
    }

    private List<InterviewIntelligenceResponseDto.Insight> selectInsights(String key, String band, String trend) {
        List<String> templates = InsightTemplates.templates()
            .getOrDefault(key, InsightTemplates.templates().getOrDefault("generic", Map.of()))
            .getOrDefault(band, Map.of())
            .getOrDefault(trend, InsightTemplates.genericList());

        List<InterviewIntelligenceResponseDto.Insight> list = new ArrayList<>();
        for (int i = 0; i < Math.min(3, templates.size()); i++) {
            String txt = templates.get(i);
            String type = txt.toLowerCase().contains("risk") || txt.toLowerCase().contains("improve") ? "RISK" : "STRENGTH";
            list.add(InterviewIntelligenceResponseDto.Insight.builder().type(type).text(txt).build());
        }
        if (list.size() < 2) {
            list.add(InterviewIntelligenceResponseDto.Insight.builder().type("STRENGTH").text("Consistent performance noted.").build());
            list.add(InterviewIntelligenceResponseDto.Insight.builder().type("RISK").text("Look for deeper examples to validate.").build());
        }
        return list;
    }

    private static class InsightTemplates {
        private static Map<String, Map<String, Map<String, List<String>>>> cache;

        static Map<String, Map<String, Map<String, List<String>>>> templates() {
            if (cache != null) return cache;
            Map<String, Map<String, List<String>>> genericBands = Map.of(
                "STRONG", Map.of(
                    "IMPROVING", List.of("Momentum is improving; keep sharing concrete wins.", "Strength evident; continue to deepen impact."),
                    "STABLE", List.of("Consistent strength; maintain clarity and depth.", "Solid performance; consider stretching into harder examples."),
                    "DECLINING", List.of("Strength areas present; ensure recent examples stay sharp.", "Guard against complacency; refresh narratives.")
                ),
                "GOOD", Map.of(
                    "IMPROVING", List.of("Trajectory is positive; highlight recent progress.", "Growing strength; add measurable outcomes."),
                    "STABLE", List.of("Good baseline; add specifics to solidify impact.", "Solid answers; deepen with metrics and trade-offs."),
                    "DECLINING", List.of("Stability slipping; focus on recent wins.", "Address gaps with clearer ownership and results.")
                ),
                "NEEDS_WORK", Map.of(
                    "IMPROVING", List.of("Early improvements; keep adding concrete detail.", "Progressing; prepare sharper examples."),
                    "STABLE", List.of("Needs clearer ownership and outcomes.", "Provide structured narratives with decisions and results."),
                    "DECLINING", List.of("Recent answers regress; tighten structure and evidence.", "Rebuild with specific actions and results.")
                )
            );
            cache = Map.of(
                "generic", genericBands
            );
            return cache;
        }

        static List<String> genericList() {
            return List.of("Provide concrete examples with outcomes.", "Clarify your personal contribution.");
        }
    }

    private double averageLast(List<Double> scores, int n) {
        if (scores == null || scores.isEmpty()) return 0.0;
        int from = Math.max(0, scores.size() - n);
        List<Double> sub = scores.subList(from, scores.size());
        return sub.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    private static class QaEntry {
        private String questionId;
        private String question;
        private String answer;

        public QaEntry() {
        }

        public QaEntry(String questionId, String question, String answer) {
            this.questionId = questionId;
            this.question = question;
            this.answer = answer;
        }

        public String getQuestionId() {
            return questionId;
        }

        public String getQuestion() {
            return question;
        }

        public String getAnswer() {
            return answer;
        }

        public void setAnswer(String answer) {
            this.answer = answer;
        }
    }

    private record QuestionBank(String version, Constraints constraints, List<String> styles, List<String> intro, List<Dimension> dimensions) { }

    private record Constraints(boolean deterministic, boolean no_llm_calls, String selection_strategy) { }

    private record Dimension(String key, String name, Questions questions) { }

    private record Questions(List<String> opening, List<String> probe, List<String> challenge) { }

    private record FitBlock(boolean computed, Integer fitScore, String fitTrend, Double overall) {
        static FitBlock notComputed() {
            return new FitBlock(false, null, null, null);
        }

        InterviewIntelligenceResponseDto.Fit toDto(String currentDimension, String trend) {
            return InterviewIntelligenceResponseDto.Fit.builder()
                .computed(computed)
                .overall(overall)
                .currentDimension(currentDimension)
                .trend(trend)
                .build();
        }
    }

    private record Selection(Question question, String profileDimensionUsed) {}
}
