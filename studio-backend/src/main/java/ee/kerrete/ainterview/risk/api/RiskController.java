package ee.kerrete.ainterview.risk.api;

import ee.kerrete.ainterview.interview.dto.InterviewProfileDto;
import ee.kerrete.ainterview.interview.service.InterviewProfileService;
import ee.kerrete.ainterview.risk.dto.AnalyzeRequest;
import ee.kerrete.ainterview.risk.dto.AnalyzeResponse;
import ee.kerrete.ainterview.risk.dto.RefineRequest;
import ee.kerrete.ainterview.risk.dto.RefineResponse;
import ee.kerrete.ainterview.risk.service.ReplaceabilityRiskService;
import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final ReplaceabilityRiskService service;
    private final InterviewProfileService interviewProfileService;

    @PostMapping("/analyze")
    public AnalyzeResponse analyze(@RequestBody AnalyzeRequest request) {
        return service.analyze(request);
    }

    @PostMapping("/refine")
    public RefineResponse refine(@RequestBody RefineRequest request) {
        return service.refine(request);
    }

    @GetMapping("/questions")
    public QuestionsResponse questions() {
        // Lightweight stub list for public consumption
        return new QuestionsResponse(List.of(
            "Which parts of your job rely most on human judgment?",
            "How often do you use AI tools in your daily work?",
            "What tasks would be hardest to automate in your role?"
        ));
    }

    @GetMapping("/summary")
    public RiskSummaryResponse summary(@RequestParam(value = "sessionUuid", required = false) UUID sessionUuid) {
        int riskScore = 37;
        String band = "MEDIUM";
        String message = "Heuristic risk snapshot";

        List<String> missingSignals = new ArrayList<>();
        if (sessionUuid != null) {
            InterviewProfileDto profile = loadProfile(sessionUuid);
            if (profile != null) {
                missingSignals.addAll(safe(profile.getInterviewerProbePriorities()));
            } else {
                missingSignals.add("profile_not_found");
            }
        } else {
            missingSignals.add("session_missing");
        }

        if (missingSignals.isEmpty()) {
            missingSignals.add("insufficient_signals");
        }

        double confidence = computeConfidence(missingSignals.size());

        return new RiskSummaryResponse(riskScore, band, message, confidence, dedupe(missingSignals));
    }

    private InterviewProfileDto loadProfile(UUID sessionUuid) {
        try {
            return interviewProfileService.loadProfile(sessionUuid);
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> safe(List<String> list) {
        return list == null ? List.of() : list;
    }

    private List<String> dedupe(List<String> list) {
        return new ArrayList<>(new LinkedHashSet<>(list));
    }

    private double computeConfidence(int missingCount) {
        double c = 1.0 - (missingCount * 0.1);
        return Math.max(0.2, Math.min(1.0, c));
    }

    public record RiskSummaryResponse(int riskScore, String band, String message, double confidence, List<String> missingSignals) {}

    public record QuestionsResponse(List<String> questions) {}
}
