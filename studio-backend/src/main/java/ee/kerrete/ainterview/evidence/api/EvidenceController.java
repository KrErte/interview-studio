package ee.kerrete.ainterview.evidence.api;

import ee.kerrete.ainterview.auth.util.SecurityUtils;
import ee.kerrete.ainterview.evidence.dto.CreateEvidenceRequest;
import ee.kerrete.ainterview.evidence.dto.EvidenceAuditPreviewDto;
import ee.kerrete.ainterview.evidence.dto.EvidenceEntryDto;
import ee.kerrete.ainterview.evidence.dto.EvidenceListResponse;
import ee.kerrete.ainterview.evidence.model.EvidenceStatus;
import ee.kerrete.ainterview.evidence.service.EvidenceService;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import ee.kerrete.ainterview.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST controller for evidence log endpoints.
 * Implements evidence decay visualization and retention mechanics.
 */
@RestController
@RequestMapping("/api/evidence")
@RequiredArgsConstructor
@Slf4j
public class EvidenceController {

    private final EvidenceService evidenceService;

    /**
     * Create a new evidence entry.
     *
     * POST /api/evidence
     * Body: { "content": "..." }
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public EvidenceEntryDto createEvidence(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody CreateEvidenceRequest request) {

        String email = resolveEmail(user);
        log.debug("Creating evidence for user: {}", email);
        return evidenceService.createEvidence(email, request);
    }

    /**
     * Get all evidence entries for the current user.
     * Includes computed decay fields: ageDays, weight, status, needsReanchor.
     *
     * GET /api/evidence?status=FRESH|STALE|OLD|ARCHIVE
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EvidenceListResponse> getEvidenceList(
            @CurrentUser AuthenticatedUser user,
            @RequestParam(value = "status", required = false) String statusParam) {

        String email = resolveEmail(user);
        log.debug("Fetching evidence list for user: {}", email);

        EvidenceStatus statusFilter = null;
        if (statusParam != null && !statusParam.isBlank()) {
            try {
                statusFilter = EvidenceStatus.valueOf(statusParam.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status filter: {}", statusParam);
            }
        }

        EvidenceListResponse response = evidenceService.getEvidenceList(email, statusFilter);
        return ResponseEntity.ok(response);
    }

    /**
     * Anchor (re-confirm) an evidence entry.
     * Updates last_anchored_at to now and increments anchor_count.
     *
     * POST /api/evidence/{id}/anchor
     */
    @PostMapping("/{id}/anchor")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EvidenceEntryDto> anchorEvidence(
            @CurrentUser AuthenticatedUser user,
            @PathVariable("id") UUID evidenceId) {

        String email = resolveEmail(user);
        log.debug("Anchoring evidence {} for user: {}", evidenceId, email);

        EvidenceEntryDto result = evidenceService.anchorEvidence(email, evidenceId);
        return ResponseEntity.ok(result);
    }

    /**
     * Get silent audit preview.
     * Returns evidence health metrics without gamification.
     *
     * GET /api/evidence/audit/preview
     */
    @GetMapping("/audit/preview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EvidenceAuditPreviewDto> getAuditPreview(
            @CurrentUser AuthenticatedUser user) {

        String email = resolveEmail(user);
        log.debug("Generating audit preview for user: {}", email);

        EvidenceAuditPreviewDto preview = evidenceService.getAuditPreview(email);
        return ResponseEntity.ok(preview);
    }

    private String resolveEmail(AuthenticatedUser user) {
        if (user != null && user.email() != null) {
            return user.email();
        }
        return SecurityUtils.resolveEmailOrAnonymous();
    }
}
