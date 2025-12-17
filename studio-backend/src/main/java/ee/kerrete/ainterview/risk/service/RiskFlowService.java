package ee.kerrete.ainterview.risk.service;

import ee.kerrete.ainterview.risk.dto.RiskFlowStartRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowEvaluateRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowEvaluateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    private final Map<UUID, FlowState> flows = new ConcurrentHashMap<>();

    public RiskFlowStartResponse start(String email, RiskFlowStartRequest request) {
        UUID flowId = UUID.randomUUID();
        String mode = request == null || request.getMode() == null || request.getMode().isBlank()
                ? "STANDARD"
                : request.getMode().trim();

        FlowState state = new FlowState();
        state.email = email;
        state.servedCount = 0;
        state.questions = new ArrayList<>(questionBank.questionsForMode(mode));
        if (state.questions.isEmpty()) {
            state.questions = new ArrayList<>(questionBank.defaultQuestions());
        }
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
        UUID flowId = resolveFlowId(request);
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
        UUID flowId = resolveFlowId(request.getFlowId(), request.getSessionId());
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

        return RiskFlowAnswerResponse.builder()
                .flowId(flowId.toString())
                .questionId(qId)
                .status("RECEIVED")
                .receivedAt(Instant.now().toString())
                .build();
    }

    public RiskFlowEvaluateResponse evaluate(String email, RiskFlowEvaluateRequest request) {
        UUID flowId = resolveFlowId(request.getFlowId(), request.getSessionId());
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

    private UUID resolveFlowId(RiskFlowNextRequest request) {
        return resolveFlowId(request.getFlowId(), request.getSessionId());
    }

    private UUID resolveFlowId(UUID flowId, UUID sessionId) {
        UUID resolved = flowId != null ? flowId : sessionId;
        if (resolved == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "flowId is required");
        }
        return resolved;
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

