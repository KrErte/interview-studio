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

    // Track question progress per session
    private final java.util.concurrent.ConcurrentHashMap<String, Integer> sessionQuestionIndex = new java.util.concurrent.ConcurrentHashMap<>();

    private static final List<Map<String, Object>> QUESTIONS = List.of(
        Map.of(
            "id", "q1",
            "type", "TEXT",
            "text", "Can you describe a recent professional challenge you faced and how you approached solving it?",
            "title", "Problem-Solving",
            "placeholder", "Describe the challenge, your approach, and the outcome...",
            "required", true
        ),
        Map.of(
            "id", "q2",
            "type", "TEXT",
            "text", "How do you typically stay updated with new skills and industry trends in your field?",
            "title", "Continuous Learning",
            "placeholder", "Share your learning strategies and recent skill acquisitions...",
            "required", true
        ),
        Map.of(
            "id", "q3",
            "type", "TEXT",
            "text", "Describe your experience collaborating with cross-functional teams. What communication practices work best for you?",
            "title", "Team Collaboration",
            "placeholder", "Discuss team dynamics, communication methods, and collaboration outcomes...",
            "required", true
        )
    );

    /**
     * Start a new assessment session.
     */
    @PostMapping("/start")
    public ResponseEntity<StartAssessmentResponse> startAssessment(@RequestBody(required = false) StartAssessmentRequest request) {
        String sessionId = "session-" + System.currentTimeMillis();
        sessionQuestionIndex.put(sessionId, 0);
        return ResponseEntity.ok(new StartAssessmentResponse(sessionId));
    }

    /**
     * Get assessment result by session ID.
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<AssessmentResultResponse> getAssessment(@PathVariable String sessionId) {
        return ResponseEntity.ok(createMockAssessment(sessionId));
    }

    /**
     * Get the next question in the assessment flow.
     */
    @PostMapping("/next-question")
    public ResponseEntity<Map<String, Object>> getNextQuestion(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        int idx = sessionQuestionIndex.getOrDefault(sessionId, 0);

        if (idx >= QUESTIONS.size()) {
            return ResponseEntity.status(404).body(Map.of(
                "sessionId", sessionId,
                "error", "No more questions",
                "complete", true
            ));
        }

        Map<String, Object> question = QUESTIONS.get(idx);
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "question", question,
            "index", idx + 1,
            "total", QUESTIONS.size()
        ));
    }

    /**
     * Submit an answer to a question.
     */
    @PostMapping("/submit-answer")
    public ResponseEntity<Map<String, Object>> submitAnswer(@RequestBody Map<String, Object> request) {
        String sessionId = (String) request.get("sessionId");
        sessionQuestionIndex.merge(sessionId, 1, Integer::sum);
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "success", true,
            "confidenceImpact", 0
        ));
    }

    /**
     * Skip a question.
     */
    @PostMapping("/skip-question")
    public ResponseEntity<Map<String, Object>> skipQuestion(@RequestBody Map<String, Object> request) {
        String sessionId = (String) request.get("sessionId");
        sessionQuestionIndex.merge(sessionId, 1, Integer::sum);
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "success", true,
            "confidenceImpact", -8
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
