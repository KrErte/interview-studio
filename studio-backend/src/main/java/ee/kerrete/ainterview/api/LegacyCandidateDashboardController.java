package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.dto.dashboard.DashboardResponse;
import ee.kerrete.ainterview.service.CandidateDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Legacy compatibility controller for /api/me/dashboard.
 * TODO: remove after next release once frontend migrates to /api/candidate/dashboard.
 */
@Deprecated
@RestController
@RequestMapping("/api/me/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LegacyCandidateDashboardController {

    private final CandidateDashboardService candidateDashboardService;

    @GetMapping
    public DashboardResponse getDashboard(@RequestParam(name = "email", required = false) String email) {
        return candidateDashboardService.getDashboard(email);
    }
}

