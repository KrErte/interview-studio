package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.auth.util.SecurityUtils;
import ee.kerrete.ainterview.dto.JobMatchDto;
import ee.kerrete.ainterview.dto.JobMatchRequest;
import ee.kerrete.ainterview.model.JobAnalysisSession;
import ee.kerrete.ainterview.repository.JobAnalysisSessionRepository;
import ee.kerrete.ainterview.service.JobMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping({"/api/candidate/job-match", "/api/job-match"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class JobMatchController {

    private final JobMatchService jobMatchService;
    private final JobAnalysisSessionRepository jobAnalysisSessionRepository;

    @PostMapping("/match")
    public List<JobMatchDto> match(@RequestBody JobMatchRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            request.setEmail(SecurityUtils.resolveEmailOrAnonymous());
        }
        return jobMatchService.match(request);
    }

    @GetMapping("/sessions")
    public List<JobMatchSessionDto> listSessions() {
        String email = SecurityUtils.resolveEmailOrAnonymous();
        List<JobAnalysisSession> sessions = jobAnalysisSessionRepository.findTop10ByEmailOrderByCreatedAtDesc(email);
        return sessions.stream()
            .map(this::toDto)
            .toList();
    }

    private JobMatchSessionDto toDto(JobAnalysisSession session) {
        return new JobMatchSessionDto(
            session.getId(),
            session.getJobTitle(),
            session.getMatchScore(),
            session.getSummary(),
            session.getCreatedAt()
        );
    }

    public record JobMatchSessionDto(Long id, String jobTitle, Double matchScore, String summary, LocalDateTime createdAt) {}
}

