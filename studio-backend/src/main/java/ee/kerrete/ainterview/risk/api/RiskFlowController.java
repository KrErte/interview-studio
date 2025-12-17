package ee.kerrete.ainterview.risk.api;

import ee.kerrete.ainterview.risk.dto.RiskFlowStartRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowNextResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowAnswerResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowEvaluateRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowEvaluateResponse;
import ee.kerrete.ainterview.risk.dto.RiskFlowSummaryResponse;
import ee.kerrete.ainterview.risk.service.RiskFlowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/risk/flow")
@RequiredArgsConstructor
public class RiskFlowController {

    private final RiskFlowService riskFlowService;

    @PostMapping(
        value = "/start",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RiskFlowStartResponse> start(
            @Valid @RequestBody RiskFlowStartRequest req,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        RiskFlowStartResponse response = riskFlowService.start(email, req);
        return ResponseEntity.ok(response);
    }

    @PostMapping(
        value = "/next",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RiskFlowNextResponse> next(
            @Valid @RequestBody RiskFlowNextRequest req,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        RiskFlowNextResponse response = riskFlowService.next(email, req);
        return ResponseEntity.ok(response);
    }

    @PostMapping(
        value = {"/answer", "/answer."},
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RiskFlowAnswerResponse> answer(
            @Valid @RequestBody RiskFlowAnswerRequest req,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        RiskFlowAnswerResponse response = riskFlowService.answer(email, req);
        return ResponseEntity.ok(response);
    }

    @PostMapping(
        value = {"/evaluate", "/evaluate."},
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RiskFlowEvaluateResponse> evaluate(
            @Valid @RequestBody RiskFlowEvaluateRequest req,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        RiskFlowEvaluateResponse response = riskFlowService.evaluate(email, req);
        return ResponseEntity.ok(response);
    }

    @GetMapping(
        value = "/{flowId}/summary",
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RiskFlowSummaryResponse> summary(
            @PathVariable("flowId") String flowId,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        RiskFlowSummaryResponse response = riskFlowService.summary(email, flowId);
        return ResponseEntity.ok(response);
    }
}

