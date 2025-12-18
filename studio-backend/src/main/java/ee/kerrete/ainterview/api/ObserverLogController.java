package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.dto.ObserverLogDto;
import ee.kerrete.ainterview.service.ObserverLogService;
import ee.kerrete.ainterview.support.SessionIdParser;
import ee.kerrete.ainterview.support.SessionIdParser.SessionIdentifier;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/observer-logs")
@RequiredArgsConstructor
public class ObserverLogController {

    private final ObserverLogService observerLogService;
    private final SessionIdParser sessionIdParser;

    @GetMapping
    public ResponseEntity<List<ObserverLogDto>> get(@RequestParam(value = "sessionId", required = false) String sessionId,
                                                    @RequestParam(value = "sessionUuid", required = false) String sessionUuidAlias) {
        String raw = sessionId != null ? sessionId : sessionUuidAlias;
        SessionIdentifier session = sessionIdParser.parseRequired(raw);
        if (session.mock()) {
            return ResponseEntity.ok(List.of());
        }
        List<ObserverLogDto> logs = observerLogService.getForSession(session.uuid());
        return ResponseEntity.ok(logs);
    }
}

