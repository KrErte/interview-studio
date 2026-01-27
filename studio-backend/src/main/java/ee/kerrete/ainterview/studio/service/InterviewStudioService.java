package ee.kerrete.ainterview.studio.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.studio.dto.*;
import ee.kerrete.ainterview.studio.model.InterviewStudioSession;
import ee.kerrete.ainterview.studio.model.InterviewStudioSession.AssessmentStatus;
import ee.kerrete.ainterview.studio.model.InterviewStudioSession.SessionMode;
import ee.kerrete.ainterview.studio.repository.InterviewStudioSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for Interview Studio V2 session management and scoring.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewStudioService {

    private final InterviewStudioSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    /**
     * Create a new simple mode session (guest).
     */
    @Transactional
    public SessionResponse createSimpleSession(SimpleSessionRequest request) {
        InterviewStudioSession session = InterviewStudioSession.builder()
                .mode(SessionMode.SIMPLE)
                .targetRole(request.targetRole())
                .experienceLevel(request.experienceLevel())
                .mainChallenge(request.mainChallenge())
                .build();

        // Calculate assessment
        AssessmentResult assessment = calculateSimpleAssessment(request);
        applyAssessment(session, assessment);

        session = sessionRepository.save(session);
        log.info("Created simple session: id={}, status={}", session.getId(), session.getStatus());

        return toSessionResponse(session, false);
    }

    /**
     * Create a new advanced mode session (authenticated).
     */
    @Transactional
    public SessionResponse createAdvancedSession(AdvancedSessionRequest request, Long userId) {
        String shareId = UUID.randomUUID().toString();

        InterviewStudioSession session = InterviewStudioSession.builder()
                .mode(SessionMode.ADVANCED)
                .userId(userId)
                .shareId(shareId)
                .targetRole(request.targetRole())
                .lastWorkedInRole(request.lastWorkedInRole())
                .urgency(request.urgency())
                .recentWorkExamples(request.recentWorkExamples())
                .mainBlocker(request.mainBlocker())
                .cvText(request.cvText())
                .build();

        // Calculate assessment
        AssessmentResult assessment = calculateAdvancedAssessment(request);
        applyAssessment(session, assessment);

        session = sessionRepository.save(session);
        log.info("Created advanced session: id={}, userId={}, status={}", session.getId(), userId, session.getStatus());

        return toSessionResponse(session, false);
    }

    /**
     * Get a session by ID.
     */
    @Transactional(readOnly = true)
    public Optional<SessionResponse> getSession(Long sessionId, boolean includePaidContent) {
        return sessionRepository.findById(sessionId)
                .map(session -> toSessionResponse(session, includePaidContent && session.isPaid()));
    }

    /**
     * Get a session by share ID (public access).
     */
    @Transactional(readOnly = true)
    public Optional<SessionResponse> getSessionByShareId(String shareId) {
        return sessionRepository.findByShareId(shareId)
                .map(session -> toSessionResponse(session, session.isPaid()));
    }

    /**
     * Get session history for a user.
     */
    @Transactional(readOnly = true)
    public List<SessionSummary> getSessionHistory(Long userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toSessionSummary)
                .toList();
    }

    /**
     * Mark a session as paid.
     */
    @Transactional
    public SessionResponse markSessionPaid(Long sessionId, String paymentIntentId) {
        InterviewStudioSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        session.setPaid(true);
        session.setPaymentIntentId(paymentIntentId);
        session.setPaidAt(LocalDateTime.now());

        // Generate paid content if not already present
        if (session.getPlanJson() == null) {
            generatePaidContent(session);
        }

        session = sessionRepository.save(session);
        log.info("Marked session as paid: id={}", sessionId);

        return toSessionResponse(session, true);
    }

    /**
     * Calculate assessment for simple mode.
     * Deterministic rules based on experience level and challenge.
     */
    private AssessmentResult calculateSimpleAssessment(SimpleSessionRequest request) {
        AssessmentStatus status;
        List<String> blockers = new ArrayList<>();
        String teaserAction;

        String experience = request.experienceLevel();
        String challenge = request.mainChallenge();

        // Determine status based on experience level
        if ("none".equals(experience) || "learning".equals(experience)) {
            status = AssessmentStatus.RED;
            blockers.add("No direct experience in target role yet");
            blockers.add("Need to build portfolio or side projects to demonstrate skills");
            blockers.add("Consider entry-level positions or internships first");
            teaserAction = "Start with one small project that demonstrates " + request.targetRole() + " skills...";
        } else if ("1-2years".equals(experience) || "some".equals(experience)) {
            status = AssessmentStatus.YELLOW;
            blockers.add("Experience exists but may not be well-positioned for target role");
            blockers.add("CV likely needs optimization for ATS and recruiter scans");
            blockers.add("Interview preparation needed for common " + request.targetRole() + " questions");
            teaserAction = "Rewrite your CV summary to lead with your strongest " + request.targetRole() + " achievement...";
        } else {
            status = AssessmentStatus.GREEN;
            blockers.add("CV positioning may not highlight your most relevant experience");
            blockers.add("Interview preparation can sharpen your competitive edge");
            blockers.add("Salary negotiation strategy could maximize your offer");
            teaserAction = "Lead every interview answer with a concrete metric from your " + request.targetRole() + " work...";
        }

        // Adjust based on challenge
        if ("no-responses".equals(challenge) || "rejected".equals(challenge)) {
            if (status == AssessmentStatus.GREEN) {
                status = AssessmentStatus.YELLOW;
            }
            blockers.set(0, "Your applications aren't getting through — likely a CV or positioning issue");
        } else if ("interviews".equals(challenge)) {
            blockers.set(1, "Converting interviews to offers is your main gap — need to work on presentation");
        }

        return new AssessmentResult(status, blockers, teaserAction);
    }

    /**
     * Calculate assessment for advanced mode.
     * Deterministic rules based on CLAUDE.md scoring.
     */
    private AssessmentResult calculateAdvancedAssessment(AdvancedSessionRequest request) {
        AssessmentStatus status;
        List<String> blockers = new ArrayList<>();
        String teaserAction;

        String lastWorked = request.lastWorkedInRole();
        String urgency = request.urgency();
        String examples = request.recentWorkExamples();
        String blocker = request.mainBlocker();

        // RED conditions
        boolean isRed = false;
        if (">18months".equals(lastWorked) || "never".equals(lastWorked)) {
            isRed = true;
        }
        if ("never".equals(lastWorked) && (examples == null || examples.trim().length() < 50)) {
            isRed = true;
        }
        if ("immediate".equals(urgency) && (">18months".equals(lastWorked) || "never".equals(lastWorked))) {
            isRed = true;
        }

        // GREEN conditions
        boolean isGreen = false;
        if ("current".equals(lastWorked) || "<6months".equals(lastWorked)) {
            if ("cv".equals(blocker) || "market".equals(blocker)) {
                isGreen = true;
            }
        }

        // Determine status
        if (isRed) {
            status = AssessmentStatus.RED;
        } else if (isGreen) {
            status = AssessmentStatus.GREEN;
        } else {
            status = AssessmentStatus.YELLOW;
        }

        // Generate blockers based on status and inputs
        switch (status) {
            case RED:
                blockers.add("Significant gap since last relevant role — need bridge experience or reframing");
                blockers.add("Target role mismatch with recent experience — consider adjacent roles first");
                blockers.add("Urgency + weak signals = high rejection risk — slow down and strengthen profile");
                teaserAction = "Before applying anywhere: identify 3 transferable skills from your recent work that map to " + request.targetRole() + "...";
                break;
            case YELLOW:
                blockers.add("Relevant experience exists but isn't optimally positioned for your target");
                blockers.add("CV likely undersells your actual capabilities — needs metric-driven rewrite");
                blockers.add("Interview preparation needed to articulate your fit clearly");
                teaserAction = "Rewrite your CV summary: lead with years of experience + one concrete achievement metric...";
                break;
            case GREEN:
                blockers.add("Strong foundation — main work is positioning and presentation");
                blockers.add("CV optimization can increase response rate significantly");
                blockers.add("Interview prep will help you negotiate from strength");
                teaserAction = "Your CV is your bottleneck. Add one quantified achievement per role and watch response rates climb...";
                break;
            default:
                blockers.add("Unable to fully assess your situation");
                blockers.add("Consider providing more details");
                blockers.add("Try a more specific target role");
                teaserAction = "Start by clarifying your target role and recent experience...";
                break;
        }

        // Customize based on specific blocker
        if ("skills".equals(blocker)) {
            blockers.set(1, "Specific skill gaps identified — need targeted upskilling or project work");
        } else if ("interviews".equals(blocker)) {
            blockers.set(2, "Interview performance is costing you offers — systematic prep needed");
        } else if ("experience".equals(blocker)) {
            blockers.set(0, "Experience gap is real — consider bridge roles or demonstrable side projects");
        }

        return new AssessmentResult(status, blockers, teaserAction);
    }

    /**
     * Apply assessment result to session entity.
     */
    private void applyAssessment(InterviewStudioSession session, AssessmentResult assessment) {
        session.setStatus(assessment.status());
        session.setBlockersJson(toJson(assessment.blockers()));
        session.setTeaserAction(assessment.teaserAction());
    }

    /**
     * Generate paid content for a session.
     */
    private void generatePaidContent(InterviewStudioSession session) {
        List<PlanAction> plan = generatePlan(session);
        List<String> cvBullets = generateCvBullets(session);
        List<String> rolesToAvoid = generateRolesToAvoid(session);
        String pivotSuggestion = generatePivotSuggestion(session);

        session.setPlanJson(toJson(plan));
        session.setCvRewriteBulletsJson(toJson(cvBullets));
        session.setRolesToAvoidJson(toJson(rolesToAvoid));
        session.setPivotSuggestion(pivotSuggestion);
    }

    /**
     * Generate 30-day action plan based on session data.
     */
    private List<PlanAction> generatePlan(InterviewStudioSession session) {
        String role = session.getTargetRole();
        AssessmentStatus status = session.getStatus();

        List<PlanAction> plan = new ArrayList<>();

        if (status == AssessmentStatus.RED) {
            plan.add(new PlanAction(1, "Identify 3 transferable skills from your experience that apply to " + role,
                    "Clear narrative for why you can do this role"));
            plan.add(new PlanAction(3, "Start one small project demonstrating " + role + " skills",
                    "Tangible proof of capability to reference in applications"));
            plan.add(new PlanAction(7, "Update LinkedIn headline and summary to target " + role,
                    "Recruiters searching for " + role + " can now find you"));
            plan.add(new PlanAction(10, "Apply to 3 entry/mid-level " + role + " positions",
                    "Test market response with realistic targets"));
            plan.add(new PlanAction(14, "Reach out to 5 people already in " + role + " for coffee chats",
                    "Insider knowledge + potential referrals"));
            plan.add(new PlanAction(21, "Evaluate responses and adjust strategy",
                    "Data-driven pivot if needed"));
            plan.add(new PlanAction(28, "If no traction: consider adjacent roles as stepping stones",
                    "Clearer path forward, even if indirect"));
        } else if (status == AssessmentStatus.YELLOW) {
            plan.add(new PlanAction(1, "Rewrite CV summary with years + one concrete metric",
                    "CV passes 6-second recruiter scan"));
            plan.add(new PlanAction(3, "Add quantified achievements to last 2 roles",
                    "CV shows impact, not just responsibilities"));
            plan.add(new PlanAction(5, "Update LinkedIn to match optimized CV",
                    "Consistent professional presence across channels"));
            plan.add(new PlanAction(7, "Apply to 5 roles matching your actual experience level",
                    "Higher response rate than reach applications"));
            plan.add(new PlanAction(14, "Prepare answers for top 5 " + role + " interview questions",
                    "No more fumbling on predictable questions"));
            plan.add(new PlanAction(21, "Follow up on applications — no response = move on quickly",
                    "Efficient pipeline management"));
            plan.add(new PlanAction(28, "If interviewing: prep negotiation strategy. If not: expand search",
                    "Either offers in hand or clear next steps"));
        } else {
            plan.add(new PlanAction(1, "Audit CV for any metrics you're underselling",
                    "Maximum impact from strong foundation"));
            plan.add(new PlanAction(3, "Research salary ranges for " + role + " at target companies",
                    "Negotiation prep before you need it"));
            plan.add(new PlanAction(5, "Apply to 10 well-matched " + role + " positions",
                    "Volume strategy from position of strength"));
            plan.add(new PlanAction(10, "Prep STAR answers for your top 5 achievements",
                    "Interview-ready with concrete examples"));
            plan.add(new PlanAction(14, "Practice salary negotiation scenarios",
                    "Don't leave money on the table"));
            plan.add(new PlanAction(21, "If multiple offers: use competing interest strategically",
                    "Maximize compensation from leverage"));
            plan.add(new PlanAction(28, "Close strongest offer with negotiated terms",
                    "Mission accomplished"));
        }

        return plan;
    }

    /**
     * Generate CV rewrite suggestions.
     */
    private List<String> generateCvBullets(InterviewStudioSession session) {
        String role = session.getTargetRole();
        List<String> bullets = new ArrayList<>();

        bullets.add("Lead with \"" + role + " with X years experience\" — not a generic objective statement");
        bullets.add("Add one quantified metric per role: \"Increased X by Y%\" beats \"Improved X\"");
        bullets.add("Remove skills that date you unless the job explicitly requires them");
        bullets.add("Keep to 2 pages max — recruiters spend 6 seconds on initial scan");
        bullets.add("Match keywords from job descriptions you're targeting");

        return bullets;
    }

    /**
     * Generate roles to avoid based on session.
     */
    private List<String> generateRolesToAvoid(InterviewStudioSession session) {
        List<String> roles = new ArrayList<>();
        AssessmentStatus status = session.getStatus();

        if (status == AssessmentStatus.GREEN) {
            roles.add("Entry-level positions — you'll be underpaid and bored within months");
            roles.add("Roles requiring 50%+ travel unless that's explicitly what you want");
        } else if (status == AssessmentStatus.YELLOW) {
            roles.add("Senior/Lead positions that require skills you're still developing");
            roles.add("Roles in industries with massive layoffs in progress");
        } else {
            roles.add("Roles requiring 5+ years of specific experience you don't have");
            roles.add("Positions at companies with hiring freezes or recent layoffs");
            roles.add("Contract roles when you need stability");
        }

        return roles;
    }

    /**
     * Generate pivot suggestion if applicable.
     */
    private String generatePivotSuggestion(InterviewStudioSession session) {
        if (session.getStatus() == AssessmentStatus.RED) {
            return "Consider targeting adjacent roles like Junior " + session.getTargetRole() +
                    " or " + session.getTargetRole() + " Assistant to build direct experience first.";
        }
        return null;
    }

    /**
     * Convert session to response DTO.
     */
    private SessionResponse toSessionResponse(InterviewStudioSession session, boolean includePaidContent) {
        List<String> blockers = fromJson(session.getBlockersJson(), new TypeReference<List<String>>() {});
        List<PlanAction> plan = null;
        List<String> cvBullets = null;
        List<String> rolesToAvoid = null;

        if (includePaidContent && session.isPaid()) {
            plan = fromJson(session.getPlanJson(), new TypeReference<List<PlanAction>>() {});
            cvBullets = fromJson(session.getCvRewriteBulletsJson(), new TypeReference<List<String>>() {});
            rolesToAvoid = fromJson(session.getRolesToAvoidJson(), new TypeReference<List<String>>() {});
        }

        return new SessionResponse(
                session.getId(),
                session.getShareId(),
                session.getMode().name(),
                session.getTargetRole(),
                session.getStatus() != null ? session.getStatus().name() : null,
                blockers != null ? blockers : List.of(),
                session.getTeaserAction(),
                session.isPaid(),
                plan,
                cvBullets,
                rolesToAvoid,
                session.getPivotSuggestion(),
                session.getCreatedAt() != null ? session.getCreatedAt().toString() : null
        );
    }

    /**
     * Convert session to summary DTO.
     */
    private SessionSummary toSessionSummary(InterviewStudioSession session) {
        return new SessionSummary(
                session.getId(),
                session.getShareId(),
                session.getTargetRole(),
                session.getStatus() != null ? session.getStatus().name() : null,
                session.isPaid(),
                session.getCreatedAt() != null ? session.getCreatedAt().toString() : null
        );
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize to JSON", e);
            return null;
        }
    }

    private <T> T fromJson(String json, TypeReference<T> typeRef) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize from JSON", e);
            return null;
        }
    }

    private record AssessmentResult(AssessmentStatus status, List<String> blockers, String teaserAction) {}
}
