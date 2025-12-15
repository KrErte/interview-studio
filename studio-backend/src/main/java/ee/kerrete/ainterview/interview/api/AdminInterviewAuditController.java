package ee.kerrete.ainterview.interview.api;

import ee.kerrete.ainterview.interview.dto.InterviewAuditEventDto;
import ee.kerrete.ainterview.interview.service.InterviewAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/interviews")
@RequiredArgsConstructor
public class AdminInterviewAuditController {

    private final InterviewAuditService interviewAuditService;

    @GetMapping("/{sessionUuid}/audit")
    public List<InterviewAuditEventDto> audit(@PathVariable("sessionUuid") UUID sessionUuid,
                                              @RequestParam(value = "limit", defaultValue = "200") int limit,
                                              @RequestParam(value = "cursor", required = false) Long cursor) {
        return interviewAuditService.listEvents(sessionUuid, limit, cursor);
    }
}


