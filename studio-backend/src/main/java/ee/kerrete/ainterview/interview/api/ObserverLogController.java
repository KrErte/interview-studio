package ee.kerrete.ainterview.interview.api;

import ee.kerrete.ainterview.interview.dto.ObserverLogEntryDto;
import ee.kerrete.ainterview.interview.service.InterviewAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/observer-log")
@RequiredArgsConstructor
public class ObserverLogController {

    private final InterviewAuditService interviewAuditService;

    @GetMapping
    public List<ObserverLogEntryDto> getLog(@RequestParam("sessionKey") UUID sessionKey,
                                            @RequestParam(name = "limit", defaultValue = "200") int limit,
                                            @RequestParam(name = "cursor", required = false) Long cursor) {
        return interviewAuditService.listObserverLog(sessionKey, limit, cursor);
    }
}

