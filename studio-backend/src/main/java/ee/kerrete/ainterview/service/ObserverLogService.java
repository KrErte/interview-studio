package ee.kerrete.ainterview.service;

import ee.kerrete.ainterview.dto.ObserverLogCreateCommand;
import ee.kerrete.ainterview.dto.ObserverLogDto;
import ee.kerrete.ainterview.model.ObserverLogEvent;
import ee.kerrete.ainterview.repository.ObserverLogEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ObserverLogService {

    private final ObserverLogEventRepository repository;

    public List<ObserverLogDto> getForSession(UUID sessionUuid) {
        if (sessionUuid == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sessionUuid is required");
        }
        return repository.findBySessionUuidOrderByCreatedAtAsc(sessionUuid)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void record(ObserverLogCreateCommand cmd) {
        if (cmd == null || cmd.getSessionUuid() == null || cmd.getStage() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sessionUuid and stage are required");
        }
        ObserverLogEvent entity = new ObserverLogEvent();
        entity.setSessionUuid(cmd.getSessionUuid());
        entity.setStage(cmd.getStage());
        entity.setRiskBefore(cmd.getRiskBefore());
        entity.setRiskAfter(cmd.getRiskAfter());
        entity.setConfidenceBefore(cmd.getConfidenceBefore());
        entity.setConfidenceAfter(cmd.getConfidenceAfter());
        entity.setSignalsJson(normalize(cmd.getSignalsJson()));
        entity.setWeaknessesJson(normalize(cmd.getWeaknessesJson()));
        entity.setRationaleSummary(normalize(cmd.getRationaleSummary()));
        repository.save(entity);
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private ObserverLogDto toDto(ObserverLogEvent e) {
        return ObserverLogDto.builder()
                .id(e.getId())
                .sessionUuid(e.getSessionUuid())
                .createdAt(e.getCreatedAt())
                .stage(e.getStage())
                .riskBefore(e.getRiskBefore())
                .riskAfter(e.getRiskAfter())
                .confidenceBefore(e.getConfidenceBefore())
                .confidenceAfter(e.getConfidenceAfter())
                .signalsJson(e.getSignalsJson())
                .weaknessesJson(e.getWeaknessesJson())
                .rationaleSummary(e.getRationaleSummary())
                .build();
    }
}

