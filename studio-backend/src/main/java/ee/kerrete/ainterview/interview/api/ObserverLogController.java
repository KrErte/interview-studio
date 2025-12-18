package ee.kerrete.ainterview.interview.api;

import ee.kerrete.ainterview.interview.dto.ObserverLogEntryDto;
import ee.kerrete.ainterview.interview.service.InterviewAuditService;
import ee.kerrete.ainterview.support.SessionIdParser;
import ee.kerrete.ainterview.support.SessionIdParser.SessionIdentifier;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("interviewObserverLogController")
@RequiredArgsConstructor
public class ObserverLogController {

    private final InterviewAuditService interviewAuditService;
    private final SessionIdParser sessionIdParser;

    @GetMapping
    public List<ObserverLogEntryDto> getLog(@RequestParam("sessionKey") String sessionKey,
                                            @RequestParam(name = "limit", defaultValue = "200") int limit,
                                            @RequestParam(name = "cursor", required = false) Long cursor) {
        SessionIdentifier session = sessionIdParser.parseRequired(sessionKey);
        if (session.mock()) {
            return List.of();
        }
        return interviewAuditService.listObserverLog(session.uuid(), limit, cursor);
    }
}

