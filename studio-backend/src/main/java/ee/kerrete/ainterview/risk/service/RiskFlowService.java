package ee.kerrete.ainterview.risk.service;

import ee.kerrete.ainterview.risk.dto.RiskFlowStartRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowEvaluateRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowEvaluateResponse;
import ee.kerrete.ainterview.risk.dto.RiskAssessmentResponse;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.dto.ObserverLogCreateCommand;
import ee.kerrete.ainterview.model.ObserverStage;
import ee.kerrete.ainterview.service.ObserverLogService;
import ee.kerrete.ainterview.support.SessionIdParser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RiskFlowService {

    private final RiskQuestionBank questionBank;
    private final ObserverLogService observerLogService;
    private final ObjectMapper objectMapper;
    private final SessionIdParser sessionIdParser;
    private final RiskAssessmentConfidenceCalculator confidenceCalculator = new RiskAssessmentConfidenceCalculator();

    private final Map<UUID, FlowState> flows = new ConcurrentHashMap<>();

    public RiskFlowStartResponse start(String email, RiskFlowStartRequest request) {
        UUID flowId = UUID.randomUUID();
        String mode = normalizeMode(request);

        FlowState state = createFlowState(email, mode);
        flows.put(flowId, state);

        return RiskFlowStartResponse.builder()
                .flowId(flowId)
                .email(email)
                .sessionId(flowId.toString())
                .startedAt(Instant.now().toString())
                .message("Risk flow started")
                .context(request == null ? null : request.getContext())
                .status("STARTED")
                .mode(mode)
                .build();
    }

    public RiskFlowNextResponse next(String email, RiskFlowNextRequest request) {
        UUID flowId = resolveFlowId(email, request.getFlowId(), request.getSessionId());
        FlowState state = flows.get(flowId);
        if (state == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flow not found");
        }
        if (!email.equals(state.email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Flow does not belong to user");
        }

        int total = state.questions.size();
        if (state.servedCount >= total) {
            return RiskFlowNextResponse.builder()
                    .flowId(flowId.toString())
                    .questionId(null)
                    .question(null)
                    .index(total)
                    .totalPlanned(total)
                    .done(true)
                    .build();
        }

        int index = state.servedCount;
        String questionText = state.questions.get(index);
        String questionId = flowId.toString() + ":" + index;
        state.servedCount = index + 1;

        boolean done = state.servedCount >= total;

        return RiskFlowNextResponse.builder()
                .flowId(flowId.toString())
                .questionId(questionId)
                .question(questionText)
                .index(index + 1) // 1-based for UX
                .totalPlanned(total)
                .done(done)
                .build();
    }

    public RiskFlowAnswerResponse answer(String email, RiskFlowAnswerRequest request) {
        UUID flowId = resolveFlowId(email, request.getFlowId(), request.getSessionId());
        FlowState state = flows.get(flowId);
        if (state == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flow not found");
        }
        if (!email.equals(state.email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Flow does not belong to user");
        }
        String qId = request.getQuestionId() == null ? flowId + ":" + state.servedCount : request.getQuestionId();
        String ans = request.getAnswer() == null ? "" : request.getAnswer().trim();
        state.answers.add(new AnswerEntry(qId, ans, Instant.now().toString()));

        SessionIdParser.SessionIdentifier sessionIdentifier = parseSafe(request.getSessionId());
        if (sessionIdentifier.hasUuid()) {
            observerLogService.record(ObserverLogCreateCommand.builder()
                    .sessionUuid(sessionIdentifier.uuid())
                    .stage(resolveClarifyingStage(state.answers.size()))
                    .signalsJson(buildSignalsJson(state.answers))
                    .rationaleSummary(buildRationaleSummary(ans))
                    .build());
        }

        return RiskFlowAnswerResponse.builder()
                .flowId(flowId.toString())
                .questionId(qId)
                .status("RECEIVED")
                .receivedAt(Instant.now().toString())
                .build();
    }

    private ObserverStage resolveClarifyingStage(int count) {
        return switch (count) {
            case 1 -> ObserverStage.CLARIFYING_Q1;
            case 2 -> ObserverStage.CLARIFYING_Q2;
            case 3 -> ObserverStage.CLARIFYING_Q3;
            default -> ObserverStage.CLARIFYING_Q1;
        };
    }

    private String buildSignalsJson(List<AnswerEntry> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            return null;
        }
    }

    private String buildRationaleSummary(String answer) {
        if (answer == null || answer.isBlank()) {
            return "Clarifying response recorded.";
        }
        String trimmed = answer.trim();
        if (trimmed.length() > 300) {
            trimmed = trimmed.substring(0, 300) + "...";
        }
        return "Clarifying response recorded to refine risk understanding: " + trimmed;
    }

    public RiskFlowEvaluateResponse evaluate(String email, RiskFlowEvaluateRequest request) {
        UUID flowId = resolveFlowId(email, request.getFlowId(), request.getSessionId());
        FlowState state = flows.get(flowId);
        if (state == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flow not found");
        }
        if (!email.equals(state.email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Flow does not belong to user");
        }
        return RiskFlowEvaluateResponse.builder()
                .flowId(flowId.toString())
                .status("EVALUATED")
                .evaluatedAt(Instant.now().toString())
                .message("Evaluation stub")
                .build();
    }

    public RiskAssessmentResponse assessment(String email, UUID sessionUuid) {
        if (sessionUuid == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sessionUuid is required");
        }
        FlowState state = flows.get(sessionUuid);
        if (state == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found for session");
        }
        if (!email.equals(state.email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assessment does not belong to user");
        }
        var answerSignals = buildAnswerSignals(state);
        var confidenceResult = confidenceCalculator.compute(answerSignals, state.questions);

        int answered = state.answers.size();
        int total = state.questions.size();
        int riskPercent = Math.min(95, Math.max(5, 100 - answered * 7));
        String band = riskPercent >= 70 ? "HIGH" : riskPercent >= 40 ? "MEDIUM" : "LOW";

        List<RiskAssessmentResponse.AssessmentWeakness> weaknesses = List.of(
                RiskAssessmentResponse.AssessmentWeakness.builder()
                        .title("Signal depth limited")
                        .description("More clarifying answers would improve confidence.")
                        .severity(answered >= Math.max(1, total / 2) ? "medium" : "high")
                        .build()
        );

        List<RiskAssessmentResponse.RiskSignal> signals = List.of(
                RiskAssessmentResponse.RiskSignal.builder()
                        .key("coverage")
                        .label("Coverage")
                        .score((int) Math.round(confidenceResult.getCompleteness() * 100))
                        .confidence(confidenceResult.getConfidence())
                        .level("MEDIUM")
                        .description("Derived from answered categories and signal strength.")
                        .build()
        );

        return RiskAssessmentResponse.builder()
                .sessionId(sessionUuid)
                .riskPercent(riskPercent)
                .riskBand(band)
                .confidence(confidenceResult.getConfidence())
                .roadmapPrecision(mapRoadmapPrecision(confidenceResult.getConfidence()))
                .weaknesses(weaknesses)
                .signals(signals)
                .build();
    }

    private UUID resolveFlowId(String email, String flowIdRaw, String sessionIdRaw) {
        SessionIdParser.SessionIdentifier flowId = parseSafe(flowIdRaw);
        SessionIdParser.SessionIdentifier sessionId = parseSafe(sessionIdRaw);

        SessionIdParser.SessionIdentifier chosen = flowId.present() ? flowId : sessionId;
        if (!chosen.present()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "flowId or sessionId is required");
        }

        if (chosen.hasUuid()) {
            return chosen.uuid();
        }
        if (chosen.mock()) {
            return ensureMockFlow(chosen.raw(), email);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sessionId. Expected UUID.");
    }

    private SessionIdParser.SessionIdentifier parseSafe(String raw) {
        try {
            return sessionIdParser.parseOptional(raw);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    private UUID ensureMockFlow(String raw, String email) {
        UUID mockId = UUID.nameUUIDFromBytes(raw.getBytes(StandardCharsets.UTF_8));
        flows.computeIfAbsent(mockId, id -> createFlowState(email, "STANDARD"));
        FlowState state = flows.get(mockId);
        if (!email.equals(state.email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Flow does not belong to user");
        }
        return mockId;
    }

    private String mapRoadmapPrecision(double confidence) {
        if (confidence >= 0.85) {
            return "HIGH";
        }
        if (confidence >= 0.70) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private List<RiskAssessmentConfidenceCalculator.Answer> buildAnswerSignals(FlowState state) {
        List<RiskAssessmentConfidenceCalculator.Answer> list = new ArrayList<>();
        for (AnswerEntry entry : state.answers) {
            list.add(RiskAssessmentConfidenceCalculator.Answer.builder()
                    .questionId(entry.questionId)
                    .questionText(resolveQuestionText(entry.questionId, state.questions))
                    .answer(entry.answer)
                    .build());
        }
        return list;
    }

    private String resolveQuestionText(String questionId, List<String> questions) {
        if (questionId == null || questions == null || questions.isEmpty()) {
            return "";
        }
        String[] parts = questionId.split(":");
        if (parts.length < 2) {
            return "";
        }
        try {
            int idx = Integer.parseInt(parts[1]);
            if (idx >= 0 && idx < questions.size()) {
                return questions.get(idx);
            }
        } catch (NumberFormatException ignored) {
        }
        return "";
    }

    private FlowState createFlowState(String email, String mode) {
        FlowState state = new FlowState();
        state.email = email;
        state.servedCount = 0;
        state.questions = new ArrayList<>(questionBank.questionsForMode(mode));
        if (state.questions.isEmpty()) {
            state.questions = new ArrayList<>(questionBank.defaultQuestions());
        }
        return state;
    }

    private String normalizeMode(RiskFlowStartRequest request) {
        if (request == null || request.getMode() == null || request.getMode().isBlank()) {
            return "STANDARD";
        }
        return request.getMode().trim();
    }

    private static class FlowState {
        String email;
        int servedCount;
        List<String> questions;
        List<AnswerEntry> answers = new ArrayList<>();
    }

    @SuppressWarnings("unused")
    private static class AnswerEntry {
        final String questionId;
        final String answer;
        final String receivedAt;

        AnswerEntry(String questionId, String answer, String receivedAt) {
            this.questionId = questionId;
            this.answer = answer;
            this.receivedAt = receivedAt;
        }
    }
}

