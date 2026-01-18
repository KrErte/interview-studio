package ee.kerrete.ainterview.risk.api;

import ee.kerrete.ainterview.support.SessionIdParser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for the assessment flow used by the frontend-risk app.
 * Provides endpoints for starting assessments and retrieving results.
 */
@RestController
@RequestMapping("/api/risk/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final SessionIdParser sessionIdParser;

    /**
     * Start a new assessment session.
     */
    @PostMapping("/start")
    public ResponseEntity<StartAssessmentResponse> startAssessment(@RequestBody(required = false) StartAssessmentRequest request) {
        // Generate a mock session ID
        String sessionId = "mock-session-" + System.currentTimeMillis();
        return ResponseEntity.ok(new StartAssessmentResponse(sessionId));
    }

    /**
     * Get assessment result by session ID.
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<AssessmentResultResponse> getAssessment(@PathVariable String sessionId) {
        // Return mock assessment data
        return ResponseEntity.ok(createMockAssessment(sessionId));
    }

    /**
     * Get the next question in the assessment flow.
     */
    @PostMapping("/next-question")
    public ResponseEntity<Map<String, Object>> getNextQuestion(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "question", Map.of(
                "id", "q1",
                "text", "What is your primary programming language?",
                "type", "single_choice",
                "options", List.of("JavaScript", "Python", "Java", "TypeScript", "Other")
            ),
            "progress", 0.2,
            "complete", false
        ));
    }

    /**
     * Submit an answer to a question.
     */
    @PostMapping("/submit-answer")
    public ResponseEntity<Map<String, Object>> submitAnswer(@RequestBody Map<String, Object> request) {
        String sessionId = (String) request.get("sessionId");
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "accepted", true,
            "progress", 0.4,
            "complete", false
        ));
    }

    /**
     * Skip a question.
     */
    @PostMapping("/skip-question")
    public ResponseEntity<Map<String, Object>> skipQuestion(@RequestBody Map<String, Object> request) {
        String sessionId = (String) request.get("sessionId");
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "skipped", true,
            "progress", 0.4,
            "complete", false
        ));
    }

    /**
     * Get roadmap for the assessment.
     */
    @PostMapping("/roadmap")
    public ResponseEntity<Map<String, Object>> getRoadmap(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "items", List.of(
                Map.of("title", "Learn TypeScript", "description", "Master TypeScript for better job prospects", "priority", "HIGH", "weeks", 4),
                Map.of("title", "Build AI Projects", "description", "Create portfolio projects with AI integration", "priority", "HIGH", "weeks", 6),
                Map.of("title", "Get AWS Certified", "description", "Obtain AWS Solutions Architect certification", "priority", "MEDIUM", "weeks", 8)
            )
        ));
    }

    private AssessmentResultResponse createMockAssessment(String sessionId) {
        return new AssessmentResultResponse(
            sessionId,
            40, // riskPercent
            "MEDIUM", // riskBand
            85, // confidence
            "Software Engineer", // currentRole
            List.of("AI Developer", "ML Engineer", "DevOps Engineer"), // pivotRoles
            List.of(
                new TimelinePoint(2026, 22, "AI assistants support but don't replace your role."),
                new TimelinePoint(2028, 38, "Repetitive tasks automated; critical thinking stays with you."),
                new TimelinePoint(2031, 57, "Role requires orchestration and systems thinking.")
            ),
            List.of(
                new Weakness("Outdated Skills", "Some skills showing signs of market decline", "MEDIUM"),
                new Weakness("Low AI Literacy", "Limited exposure to AI/ML technologies", "HIGH")
            ),
            List.of(
                new Signal("Problem Solving", 82, "Strong analytical and problem-solving abilities"),
                new Signal("Communication", 75, "Good communication skills with stakeholders"),
                new Signal("Adaptability", 68, "Shows willingness to learn new technologies")
            )
        );
    }

    // Request/Response DTOs
    public record StartAssessmentRequest(
        String cvFileId,
        ExperienceData experience
    ) {}

    public record ExperienceData(
        int yearsOfExperience,
        String currentRole,
        String seniority,
        String industry,
        String stack
    ) {}

    public record StartAssessmentResponse(String sessionId) {}

    public record AssessmentResultResponse(
        String sessionId,
        int riskPercent,
        String riskBand,
        int confidence,
        String currentRole,
        List<String> pivotRoles,
        List<TimelinePoint> timeline,
        List<Weakness> weaknesses,
        List<Signal> signals
    ) {}

    public record TimelinePoint(int year, int automationRisk, String insight) {}

    public record Weakness(String title, String description, String severity) {}

    public record Signal(String label, int score, String description) {}
}
