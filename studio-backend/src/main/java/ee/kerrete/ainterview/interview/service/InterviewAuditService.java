package ee.kerrete.ainterview.interview.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.interview.dto.InterviewAuditEventDto;
import ee.kerrete.ainterview.interview.dto.ObserverLogEntryDto;
import ee.kerrete.ainterview.model.InterviewSessionEvent;
import ee.kerrete.ainterview.model.InterviewSessionEventType;
import ee.kerrete.ainterview.repository.InterviewSessionEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewAuditService {

    private final InterviewSessionEventRepository repository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void appendEvent(UUID sessionUuid, InterviewSessionEventType type, Map<String, Object> payload) {
        String json = serialize(payload);
        InterviewSessionEvent event = InterviewSessionEvent.builder()
            .sessionUuid(sessionUuid)
            .createdAt(LocalDateTime.now())
            .eventType(type)
            .payloadJson(json)
            .build();
        repository.save(event);
    }

    @Transactional(readOnly = true)
    public List<InterviewAuditEventDto> listEvents(UUID sessionUuid, int limit, Long cursor) {
        int capped = Math.max(1, Math.min(limit, 200));
        List<InterviewSessionEvent> events;
        if (cursor != null) {
            events = repository.findTop200BySessionUuidAndIdLessThanOrderByCreatedAtDesc(sessionUuid, cursor);
        } else {
            events = repository.findTop200BySessionUuidOrderByCreatedAtDesc(sessionUuid);
        }
        return events.stream()
            .limit(capped)
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ObserverLogEntryDto> listObserverLog(UUID sessionUuid, int limit, Long cursor) {
        int capped = Math.max(1, Math.min(limit, 200));
        List<InterviewSessionEvent> events;
        if (cursor != null) {
            events = repository.findTop200BySessionUuidAndIdLessThanOrderByCreatedAtDesc(sessionUuid, cursor);
        } else {
            events = repository.findTop200BySessionUuidOrderByCreatedAtDesc(sessionUuid);
        }
        return events.stream()
            .limit(capped)
            .map(this::toObserverDto)
            .collect(Collectors.toList());
    }

    private InterviewAuditEventDto toDto(InterviewSessionEvent e) {
        return InterviewAuditEventDto.builder()
            .id(e.getId() == null ? null : String.valueOf(e.getId()))
            .ts(e.getCreatedAt() == null ? null : e.getCreatedAt().toString())
            .type(e.getEventType() == null ? null : e.getEventType().name())
            .payload(deserialize(e.getPayloadJson()))
            .build();
    }

    private ObserverLogEntryDto toObserverDto(InterviewSessionEvent e) {
        Map<String, Object> payload = deserialize(e.getPayloadJson());
        String message = safeString(payload.get("message"), e.getEventType() == null ? "event" : e.getEventType().name());
        String decision = safeString(payload.get("decision"), "unknown");
        String reason = safeString(payload.get("reason"), "unspecified");
        String questionId = safeString(payload.get("questionId"), null);
        String nextDimension = safeString(payload.get("nextDimension"), null);
        String currentDimension = safeString(payload.get("currentDimension"), null);
        String profileDimensionUsed = safeString(payload.get("profileDimensionUsed"), null);
        String dimension = firstNonNull(nextDimension, profileDimensionUsed, currentDimension, "UNKNOWN");
        String currentStyle = safeString(payload.get("currentStyle"), null);
        String nextStyle = safeString(payload.get("nextStyle"), null);
        String style = firstNonNull(nextStyle, currentStyle, "SYSTEM");

        return ObserverLogEntryDto.builder()
            .id(e.getId() == null ? null : String.valueOf(e.getId()))
            .ts(e.getCreatedAt() == null ? null : e.getCreatedAt().toString())
            .message(message)
            .decision(decision)
            .reason(reason)
            .dimension(dimension)
            .style(style)
            .questionId(questionId)
            .payloadJson(e.getPayloadJson())
            .build();
    }

    private String safeString(Object value, String fallback) {
        if (value == null) return fallback;
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? fallback : s;
    }

    private String firstNonNull(String... vals) {
        for (String v : vals) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }

    private String serialize(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload == null ? Collections.emptyMap() : payload);
        } catch (Exception ex) {
            return "{}";
        }
    }

    private Map<String, Object> deserialize(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }
}


