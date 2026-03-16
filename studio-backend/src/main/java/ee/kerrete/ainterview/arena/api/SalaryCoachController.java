package ee.kerrete.ainterview.arena.api;

import ee.kerrete.ainterview.arena.dto.SalaryCoachMessageRequest;
import ee.kerrete.ainterview.arena.dto.SalaryCoachResponse;
import ee.kerrete.ainterview.arena.dto.SalaryCoachStartRequest;
import ee.kerrete.ainterview.arena.service.SalaryCoachService;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/arena/salary-coach")
@RequiredArgsConstructor
public class SalaryCoachController {

    private final SalaryCoachService salaryCoachService;

    @PostMapping("/start")
    public SalaryCoachResponse start(
        @Valid @RequestBody SalaryCoachStartRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return salaryCoachService.startSession(request, user.id());
    }

    @PostMapping("/message")
    public SalaryCoachResponse message(
        @Valid @RequestBody SalaryCoachMessageRequest request,
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return salaryCoachService.message(request, user.id());
    }
}
