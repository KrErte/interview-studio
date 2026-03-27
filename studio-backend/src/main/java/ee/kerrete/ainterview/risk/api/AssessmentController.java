package ee.kerrete.ainterview.risk.api;

import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.model.UserTier;
import ee.kerrete.ainterview.repository.AppUserRepository;
import ee.kerrete.ainterview.risk.service.RoleQuestionBank;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import ee.kerrete.ainterview.support.SessionIdParser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    private final AppUserRepository appUserRepository;
    private final RoleQuestionBank roleQuestionBank;

    // Track question progress per session
    private final java.util.concurrent.ConcurrentHashMap<String, Integer> sessionQuestionIndex = new java.util.concurrent.ConcurrentHashMap<>();
    // Store role-specific questions per session
    private final java.util.concurrent.ConcurrentHashMap<String, List<Map<String, Object>>> sessionQuestions = new java.util.concurrent.ConcurrentHashMap<>();
    // Store submitted answers per session
    private final java.util.concurrent.ConcurrentHashMap<String, List<Map<String, Object>>> sessionAnswers = new java.util.concurrent.ConcurrentHashMap<>();
    // Store skipped question count per session
    private final java.util.concurrent.ConcurrentHashMap<String, Integer> sessionSkips = new java.util.concurrent.ConcurrentHashMap<>();
    // Store current role per session
    private final java.util.concurrent.ConcurrentHashMap<String, String> sessionRoles = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Start a new assessment session.
     */
    @PostMapping("/start")
    public ResponseEntity<StartAssessmentResponse> startAssessment(@RequestBody(required = false) StartAssessmentRequest request) {
        String sessionId = "session-" + System.currentTimeMillis();
        sessionQuestionIndex.put(sessionId, 0);

        String currentRole = "";
        if (request != null && request.experience() != null) {
            currentRole = request.experience().currentRole();
        }
        sessionRoles.put(sessionId, currentRole != null ? currentRole : "");
        sessionAnswers.put(sessionId, new java.util.ArrayList<>());
        sessionSkips.put(sessionId, 0);
        sessionQuestions.put(sessionId, roleQuestionBank.getQuestionsForRole(currentRole));

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

        List<Map<String, Object>> questions = sessionQuestions.getOrDefault(sessionId, roleQuestionBank.getQuestionsForRole(""));

        if (idx >= questions.size()) {
            return ResponseEntity.status(404).body(Map.of(
                "sessionId", sessionId,
                "error", "No more questions",
                "complete", true
            ));
        }

        Map<String, Object> question = questions.get(idx);
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "question", question,
            "index", idx + 1,
            "total", questions.size()
        ));
    }

    /**
     * Submit an answer to a question.
     */
    @PostMapping("/submit-answer")
    public ResponseEntity<Map<String, Object>> submitAnswer(@RequestBody Map<String, Object> request) {
        String sessionId = (String) request.get("sessionId");
        sessionQuestionIndex.merge(sessionId, 1, Integer::sum);
        sessionAnswers.computeIfAbsent(sessionId, k -> new java.util.ArrayList<>()).add(request);
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
        sessionSkips.merge(sessionId, 1, Integer::sum);
        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "success", true,
            "confidenceImpact", -8
        ));
    }

    /**
     * Get roadmap for the assessment.
     * FREE users: only first 3 items (teaser) with teaser=true.
     * STARTER+: full roadmap with teaser=false.
     */
    @PostMapping("/roadmap")
    public ResponseEntity<Map<String, Object>> getRoadmap(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal AuthenticatedUser authUser) {

        String sessionId = request.get("sessionId");
        String durationStr = request.getOrDefault("duration", "THIRTY_DAYS");

        List<Map<String, Object>> allItems = List.of(
            Map.of(
                "id", "roadmap-1",
                "week", 1,
                "title", "Learn TypeScript",
                "description", "Master TypeScript for better job prospects",
                "tasks", List.of("Complete TypeScript handbook", "Build a small CLI tool in TS", "Convert one JS project to TS"),
                "checkpoints", List.of(
                    Map.of("id", "cp-1", "title", "TypeScript basics complete", "description", "Finish core TS concepts", "completed", false),
                    Map.of("id", "cp-2", "title", "First TS project done", "description", "Complete a real project in TypeScript", "completed", false)
                )
            ),
            Map.of(
                "id", "roadmap-2",
                "week", 2,
                "title", "Build AI Projects",
                "description", "Create portfolio projects with AI integration",
                "tasks", List.of("Build a chatbot with OpenAI API", "Create an AI-powered code reviewer", "Deploy AI project to production"),
                "checkpoints", List.of(
                    Map.of("id", "cp-3", "title", "First AI project live", "description", "Deploy working AI project", "completed", false)
                )
            ),
            Map.of(
                "id", "roadmap-3",
                "week", 3,
                "title", "Get AWS Certified",
                "description", "Obtain AWS Solutions Architect certification",
                "tasks", List.of("Complete AWS training course", "Practice with sample exams", "Schedule certification exam"),
                "checkpoints", List.of(
                    Map.of("id", "cp-4", "title", "AWS exam scheduled", "description", "Book your certification exam date", "completed", false)
                )
            ),
            Map.of(
                "id", "roadmap-4",
                "week", 4,
                "title", "Polish Portfolio & Apply",
                "description", "Finalize your portfolio and start applying to roles",
                "tasks", List.of("Update GitHub profile", "Write case studies for top projects", "Apply to 10 target companies"),
                "checkpoints", List.of(
                    Map.of("id", "cp-5", "title", "Portfolio complete", "description", "All projects documented and live", "completed", false),
                    Map.of("id", "cp-6", "title", "First applications sent", "description", "Applied to at least 5 companies", "completed", false)
                )
            )
        );

        UserTier effectiveTier = UserTier.FREE;
        if (authUser != null && authUser.id() != null) {
            effectiveTier = appUserRepository.findById(authUser.id())
                .map(AppUser::getEffectiveTier)
                .orElse(UserTier.FREE);
        }

        boolean isTeaser = !effectiveTier.isAtLeast(UserTier.STARTER);
        List<Map<String, Object>> items = isTeaser ? allItems.subList(0, Math.min(3, allItems.size())) : allItems;

        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", sessionId);
        result.put("duration", durationStr);
        result.put("items", items);
        result.put("summary", "A personalized roadmap to strengthen your profile and reduce career risk.");
        result.put("teaser", isTeaser);

        return ResponseEntity.ok(result);
    }

    private int computeRiskPercent(String sessionId) {
        int risk = 35; // base risk

        // +5 per skipped question
        int skips = sessionSkips.getOrDefault(sessionId, 0);
        risk += skips * 5;

        // Analyze answers for negative signals
        List<Map<String, Object>> answers = sessionAnswers.getOrDefault(sessionId, List.of());
        List<String> negativeSignals = List.of(
            "no experience", "none", "never", "not sure", "no idea",
            "career switch", "changing careers", "entry level", "beginner",
            "unemployed", "laid off", "fired", "struggling",
            "not confident", "low confidence", "worried", "scared"
        );

        for (Map<String, Object> answer : answers) {
            String answerText = String.valueOf(answer.getOrDefault("answer", "")).toLowerCase();
            String selectedOption = String.valueOf(answer.getOrDefault("selectedOption", "")).toLowerCase();
            String combined = answerText + " " + selectedOption;

            for (String signal : negativeSignals) {
                if (combined.contains(signal)) {
                    risk += 10;
                    break; // only +10 per answer max
                }
            }
        }

        // If no answers submitted at all (all skipped or empty session), higher risk
        if (answers.isEmpty() && skips > 0) {
            risk += 15;
        }

        return Math.min(risk, 90);
    }

    private AssessmentResultResponse createMockAssessment(String sessionId) {
        int riskPercent = computeRiskPercent(sessionId);
        String riskBand = riskPercent >= 65 ? "HIGH" : riskPercent >= 40 ? "MEDIUM" : "LOW";
        int confidence = Math.max(50, 95 - sessionSkips.getOrDefault(sessionId, 0) * 5);
        String currentRole = sessionRoles.getOrDefault(sessionId, "Software Engineer");
        if (currentRole == null || currentRole.isBlank()) currentRole = "Software Engineer";

        return new AssessmentResultResponse(
            sessionId,
            riskPercent,
            riskBand,
            confidence,
            currentRole,
            List.of("AI Developer", "ML Engineer", "DevOps Engineer"),
            List.of(
                new TimelinePoint(2026, Math.min(riskPercent, 30), "AI assistants support but don't replace your role."),
                new TimelinePoint(2028, Math.min(riskPercent + 15, 60), "Repetitive tasks automated; critical thinking stays with you."),
                new TimelinePoint(2031, Math.min(riskPercent + 30, 80), "Role requires orchestration and systems thinking.")
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
