package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.dto.*;
import ee.kerrete.ainterview.service.PracticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/practice")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PracticeController {

    private final PracticeService practiceService;

    /**
     * Loo uus harjutussessioon antud blokerite põhjal.
     * POST /api/practice/session
     * Body: { blockers: ["gap_over_18_months", "career_switch"], targetRole: "PM" }
     */
    @PostMapping("/session")
    public ResponseEntity<PracticeSessionResponse> createSession(
            @RequestBody PracticeSessionRequest request
    ) {
        return ResponseEntity.ok(practiceService.createSession(request));
    }

    /**
     * Hinda üks vastus ja tagasta feedback.
     * POST /api/practice/answer
     */
    @PostMapping("/answer")
    public ResponseEntity<PracticeAnswerResponse> submitAnswer(
            @RequestBody PracticeAnswerRequest request
    ) {
        return ResponseEntity.ok(practiceService.evaluateAnswer(request));
    }

    /**
     * Tagasta kõik saadaval blokerid.
     * GET /api/practice/blockers
     */
    @GetMapping("/blockers")
    public ResponseEntity<List<String>> getAvailableBlockers() {
        return ResponseEntity.ok(List.of(
            "gap_over_18_months",
            "career_switch",
            "urgency_weak",
            "experience_outdated",
            "cv_positioning"
        ));
    }
}
