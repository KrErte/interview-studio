package ee.kerrete.ainterview.evidence.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.evidence.dto.CreateEvidenceRequest;
import ee.kerrete.ainterview.evidence.dto.EvidenceAuditPreviewDto;
import ee.kerrete.ainterview.evidence.dto.EvidenceEntryDto;
import ee.kerrete.ainterview.evidence.dto.EvidenceListResponse;
import ee.kerrete.ainterview.evidence.model.EvidenceAuditSnapshot;
import ee.kerrete.ainterview.evidence.model.EvidenceEntry;
import ee.kerrete.ainterview.evidence.model.EvidenceStatus;
import ee.kerrete.ainterview.evidence.repository.EvidenceAuditSnapshotRepository;
import ee.kerrete.ainterview.evidence.repository.EvidenceEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing evidence entries with decay mechanics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EvidenceService {

    private final EvidenceEntryRepository evidenceRepository;
    private final EvidenceAuditSnapshotRepository auditRepository;
    private final EvidenceDecayCalculator decayCalculator;
    private final ObjectMapper objectMapper;

    /**
     * Create a new evidence entry for the user.
     */
    @Transactional
    public EvidenceEntryDto createEvidence(String email, CreateEvidenceRequest request) {
        log.debug("Creating evidence for user: {}", email);

        EvidenceEntry entry = EvidenceEntry.builder()
                .email(email.toLowerCase())
                .content(request.content().trim())
                .build();

        EvidenceEntry saved = evidenceRepository.save(entry);
        return toDto(saved);
    }

    /**
     * Get all evidence entries for a user, optionally filtered by status.
     */
    @Transactional(readOnly = true)
    public EvidenceListResponse getEvidenceList(String email, EvidenceStatus statusFilter) {
        log.debug("Fetching evidence for user: {}, filter: {}", email, statusFilter);

        List<EvidenceEntry> entries = evidenceRepository.findByEmailOrderByLastAnchoredAtDesc(email.toLowerCase());

        List<EvidenceEntryDto> dtos = entries.stream()
                .map(this::toDto)
                .filter(dto -> statusFilter == null || dto.status() == statusFilter)
                .toList();

        // Count by status
        int freshCount = 0;
        int staleCount = 0;
        int oldCount = 0;
        int archiveCount = 0;
        double totalWeight = 0.0;

        for (EvidenceEntryDto dto : dtos) {
            totalWeight += dto.weight();
            switch (dto.status()) {
                case FRESH -> freshCount++;
                case STALE -> staleCount++;
                case OLD -> oldCount++;
                case ARCHIVE -> archiveCount++;
            }
        }

        double averageWeight = dtos.isEmpty() ? 0.0 : totalWeight / dtos.size();

        return new EvidenceListResponse(
                dtos,
                dtos.size(),
                freshCount,
                staleCount,
                oldCount,
                archiveCount,
                Math.round(averageWeight * 100.0) / 100.0
        );
    }

    /**
     * Anchor (re-confirm) an evidence entry, resetting its decay timer.
     */
    @Transactional
    public EvidenceEntryDto anchorEvidence(String email, UUID evidenceId) {
        log.debug("Anchoring evidence {} for user: {}", evidenceId, email);

        EvidenceEntry entry = evidenceRepository.findByIdAndEmail(evidenceId, email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evidence not found"));

        entry.setLastAnchoredAt(LocalDateTime.now());
        entry.setAnchorCount(entry.getAnchorCount() + 1);

        EvidenceEntry saved = evidenceRepository.save(entry);
        return toDto(saved);
    }

    /**
     * Get a preview of the silent audit metrics.
     */
    @Transactional(readOnly = true)
    public EvidenceAuditPreviewDto getAuditPreview(String email) {
        log.debug("Generating audit preview for user: {}", email);

        List<EvidenceEntry> allEntries = evidenceRepository.findByEmailOrderByLastAnchoredAtDesc(email.toLowerCase());

        if (allEntries.isEmpty()) {
            return new EvidenceAuditPreviewDto(
                    0,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    "Start logging evidence to build your exposure profile."
            );
        }

        // Calculate current exposure score (proxy: avg weight * 100)
        double totalWeight = allEntries.stream()
                .mapToDouble(e -> decayCalculator.calculateWeight(calculateAgeDays(e)))
                .sum();
        double avgWeight = totalWeight / allEntries.size();
        BigDecimal currentScore = BigDecimal.valueOf(avgWeight * 100).setScale(2, RoundingMode.HALF_UP);

        // Find oldest 3 entries by last_anchored_at
        List<EvidenceEntry> oldest3 = evidenceRepository.findOldest3ByEmail(email.toLowerCase());
        Set<UUID> oldest3Ids = oldest3.stream().map(EvidenceEntry::getId).collect(Collectors.toSet());

        // Calculate score without oldest 3
        List<EvidenceEntry> withoutOldest3 = allEntries.stream()
                .filter(e -> !oldest3Ids.contains(e.getId()))
                .toList();

        BigDecimal scoreWithoutOldest3;
        if (withoutOldest3.isEmpty()) {
            scoreWithoutOldest3 = BigDecimal.ZERO;
        } else {
            double totalWeightWithout = withoutOldest3.stream()
                    .mapToDouble(e -> decayCalculator.calculateWeight(calculateAgeDays(e)))
                    .sum();
            double avgWeightWithout = totalWeightWithout / withoutOldest3.size();
            scoreWithoutOldest3 = BigDecimal.valueOf(avgWeightWithout * 100).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal delta = scoreWithoutOldest3.subtract(currentScore);

        // Generate calm message
        String message = generateAuditMessage(allEntries, delta);

        return new EvidenceAuditPreviewDto(
                allEntries.size(),
                currentScore,
                scoreWithoutOldest3,
                delta,
                message
        );
    }

    /**
     * Save an audit snapshot (for quarterly scheduled jobs).
     */
    @Transactional
    public void saveAuditSnapshot(String email) {
        EvidenceAuditPreviewDto preview = getAuditPreview(email);

        EvidenceAuditSnapshot snapshot = EvidenceAuditSnapshot.builder()
                .email(email.toLowerCase())
                .evidenceCount(preview.evidenceCount())
                .exposureScore(preview.exposureScoreCurrent())
                .simulatedScoreWithoutOldest3(preview.exposureScoreWithoutOldest3())
                .notes(toJson(preview))
                .build();

        auditRepository.save(snapshot);
        log.info("Saved audit snapshot for user: {}", email);
    }

    private long calculateAgeDays(EvidenceEntry entry) {
        LocalDateTime anchor = entry.getLastAnchoredAt();
        if (anchor == null) {
            anchor = entry.getCreatedAt();
        }
        return ChronoUnit.DAYS.between(anchor, LocalDateTime.now());
    }

    private EvidenceEntryDto toDto(EvidenceEntry entry) {
        long ageDays = calculateAgeDays(entry);
        double weight = decayCalculator.calculateWeight(ageDays);
        EvidenceStatus status = decayCalculator.determineStatus(ageDays);

        return EvidenceEntryDto.builder()
                .id(entry.getId())
                .content(entry.getContent())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .lastAnchoredAt(entry.getLastAnchoredAt())
                .anchorCount(entry.getAnchorCount())
                .detectedCategory(entry.getDetectedCategory())
                .extractedVerbs(parseJsonArray(entry.getExtractedVerbs()))
                .extractedEntities(parseJsonArray(entry.getExtractedEntities()))
                .ageDays(ageDays)
                .weight(Math.round(weight * 100.0) / 100.0)
                .status(status)
                .needsReanchor(status.needsReanchor())
                .build();
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse JSON array: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize to JSON: {}", e.getMessage());
            return "{}";
        }
    }

    private String generateAuditMessage(List<EvidenceEntry> entries, BigDecimal delta) {
        long staleCount = entries.stream()
                .filter(e -> decayCalculator.determineStatus(calculateAgeDays(e)).needsReanchor())
                .count();

        if (entries.size() < 3) {
            return "Keep adding evidence to build a comprehensive profile.";
        }

        if (staleCount == 0) {
            return "Your evidence is well-maintained. All entries are fresh.";
        }

        if (staleCount <= 3) {
            return String.format("%d evidence entries could use a refresh. Consider re-anchoring them.", staleCount);
        }

        if (delta.compareTo(BigDecimal.ZERO) > 0) {
            return String.format("Refreshing your oldest evidence could improve your score by up to %.1f points.", delta.doubleValue());
        }

        return String.format("%d entries have become stale. Regular anchoring keeps your profile current.", staleCount);
    }
}
