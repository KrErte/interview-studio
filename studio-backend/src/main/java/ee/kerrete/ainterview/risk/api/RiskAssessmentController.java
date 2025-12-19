package ee.kerrete.ainterview.risk.api;

import ee.kerrete.ainterview.risk.dto.AssessmentNextQuestionRequest;
import ee.kerrete.ainterview.risk.dto.AssessmentStartRequest;
import ee.kerrete.ainterview.risk.dto.AssessmentSubmitAnswerRequest;
import ee.kerrete.ainterview.risk.dto.RiskAssessmentErrorResponse;
import ee.kerrete.ainterview.risk.dto.RiskAssessmentResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartResponse;
import ee.kerrete.ainterview.risk.service.RiskFlowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/risk/assessment")
@RequiredArgsConstructor
public class RiskAssessmentController {

    private final RiskFlowService riskFlowService;

    @PostMapping(
        value = "/start",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RiskFlowStartResponse> start(
            @Valid @RequestBody AssessmentStartRequest req,
            Authentication auth
    ) {
        String email = requireEmail(auth);

        RiskFlowStartRequest mapped = new RiskFlowStartRequest();
        if (StringUtils.hasText(req.getPersona())) {
            mapped.setContext(req.getPersona());
        }
        if (StringUtils.hasText(req.getDepth())) {
            mapped.setMode(req.getDepth());
        }

        RiskFlowStartResponse response = riskFlowService.start(email, mapped);
        return ResponseEntity.ok(response);
    }

    @PostMapping(
        value = "/next-question",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RiskFlowNextResponse> nextQuestion(
            @Valid @RequestBody AssessmentNextQuestionRequest req,
            Authentication auth
    ) {
        String email = requireEmail(auth);
        RiskFlowNextRequest mapped = new RiskFlowNextRequest();
        mapped.setSessionId(req.getSessionId());

        RiskFlowNextResponse response = riskFlowService.next(email, mapped);
        return ResponseEntity.ok(response);
    }

    @PostMapping(
        value = "/submit-answer",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RiskFlowAnswerResponse> submitAnswer(
            @Valid @RequestBody AssessmentSubmitAnswerRequest req,
            Authentication auth
    ) {
        String email = requireEmail(auth);
        RiskFlowAnswerRequest mapped = new RiskFlowAnswerRequest();
        mapped.setSessionId(req.getSessionId());
        mapped.setQuestionId(req.getQuestionId());
        mapped.setAnswer(req.getAnswer());

        RiskFlowAnswerResponse response = riskFlowService.answer(email, mapped);
        return ResponseEntity.ok(response);
    }

    @GetMapping(
        value = "/{sessionUuid}",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> getAssessment(
            @PathVariable("sessionUuid") UUID sessionUuid,
            Authentication auth
    ) {
        String email = requireEmail(auth);
        try {
            RiskAssessmentResponse response = riskFlowService.assessment(email, sessionUuid);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            RiskAssessmentErrorResponse body = RiskAssessmentErrorResponse.builder()
                    .code(ex.getStatusCode().toString())
                    .message(ex.getReason())
                    .sessionUuid(sessionUuid != null ? sessionUuid.toString() : null)
                    .build();
            return ResponseEntity.status(ex.getStatusCode()).body(body);
        }
    }

    private String requireEmail(Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return email;
    }
}

