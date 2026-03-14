package ee.kerrete.ainterview.session.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.model.CareerSession;
import ee.kerrete.ainterview.repository.CareerSessionRepository;
import ee.kerrete.ainterview.session.dto.CreateSessionRequest;
import ee.kerrete.ainterview.session.dto.SessionResponse;
import ee.kerrete.ainterview.session.dto.SessionSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CareerSessionService {

    private final CareerSessionRepository repository;
    private final ObjectMapper objectMapper;

    @Transactional
    public SessionResponse createSession(CreateSessionRequest request, Long userId) {
        CareerSession session = CareerSession.builder()
            .userId(userId)
            .mode(request.mode() != null ? request.mode().toUpperCase() : "SIMPLE")
            .targetRole(request.targetRole())
            .experienceLevel(request.experienceLevel())
            .mainChallenge(request.mainChallenge())
            .lastWorkedInRole(request.lastWorkedInRole())
            .urgency(request.urgency())
            .recentWorkExamples(request.recentWorkExamples())
            .mainBlocker(request.mainBlocker())
            .cvText(request.cvText())
            .build();

        // Deterministic scoring
        String status = computeStatus(session);
        session.setStatus(status);

        // Generate blockers
        List<String> blockers = generateBlockers(session);
        session.setBlockersJson(toJson(blockers));

        // Generate teaser
        session.setTeaserAction(generateTeaser(session));

        // Generate paid content
        List<SessionResponse.PlanItem> plan = generatePlan(session);
        session.setPlanJson(toJson(plan));
        session.setCvRewriteBulletsJson(toJson(generateCvBullets(session)));
        session.setRolesToAvoidJson(toJson(generateRolesToAvoid(session)));
        session.setPivotSuggestion(generatePivotSuggestion(session));

        session = repository.save(session);
        log.info("Session created: id={}, status={}, userId={}", session.getId(), status, userId);

        return toResponse(session);
    }

    public SessionResponse getSession(Long sessionId) {
        CareerSession session = repository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        return toResponse(session);
    }

    public SessionResponse getByShareId(String shareId) {
        CareerSession session = repository.findByShareId(shareId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shared session not found"));
        return toResponse(session);
    }

    public List<SessionSummary> getUserSessions(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(s -> new SessionSummary(
                s.getId(), s.getShareId(), s.getMode(), s.getTargetRole(),
                s.getStatus(), s.isPaid(),
                s.getCreatedAt() != null ? s.getCreatedAt().toString() : null
            ))
            .toList();
    }

    // ================= Deterministic Scoring =================

    private String computeStatus(CareerSession s) {
        boolean isAdvanced = "ADVANCED".equals(s.getMode());

        // RED conditions
        if (isAdvanced) {
            String lastWorked = s.getLastWorkedInRole();
            if (lastWorked != null && (lastWorked.contains("2+") || lastWorked.contains("never"))) {
                return "RED";
            }
            String urgency = s.getUrgency();
            String blocker = s.getMainBlocker();
            boolean urgentNeed = urgency != null && (urgency.contains("immediate") || urgency.contains("1-2 weeks"));
            boolean weakSignals = blocker != null && (blocker.contains("no_experience") || blocker.contains("career_switch"));
            if (urgentNeed && weakSignals) {
                return "RED";
            }
            String examples = s.getRecentWorkExamples();
            boolean careerSwitch = blocker != null && blocker.contains("career_switch");
            boolean noExamples = examples == null || examples.isBlank();
            if (careerSwitch && noExamples) {
                return "RED";
            }
        } else {
            String exp = s.getExperienceLevel();
            String challenge = s.getMainChallenge();
            if (exp != null && exp.contains("none")) {
                return "RED";
            }
            if (exp != null && exp.contains("beginner") &&
                challenge != null && challenge.contains("career_switch")) {
                return "RED";
            }
        }

        // GREEN conditions
        if (isAdvanced) {
            String lastWorked = s.getLastWorkedInRole();
            String blocker = s.getMainBlocker();
            boolean recentExp = lastWorked != null && (lastWorked.contains("current") || lastWorked.contains("6_months"));
            boolean cvIssue = blocker != null && (blocker.contains("cv") || blocker.contains("positioning"));
            if (recentExp && cvIssue) {
                return "GREEN";
            }
            if (recentExp) {
                return "GREEN";
            }
        } else {
            String exp = s.getExperienceLevel();
            String challenge = s.getMainChallenge();
            boolean experienced = exp != null && (exp.contains("intermediate") || exp.contains("expert"));
            boolean cvIssue = challenge != null && (challenge.contains("cv") || challenge.contains("positioning"));
            if (experienced && cvIssue) {
                return "GREEN";
            }
            if (exp != null && exp.contains("expert")) {
                return "GREEN";
            }
        }

        // Default: YELLOW
        return "YELLOW";
    }

    private List<String> generateBlockers(CareerSession s) {
        String role = s.getTargetRole() != null ? s.getTargetRole() : "this role";

        return switch (s.getStatus()) {
            case "RED" -> List.of(
                "Your experience gap for " + role + " is significant and may require retraining",
                "Current skill signals don't align with market expectations for " + role,
                "Urgency level doesn't match your readiness — rushing may lead to rejection cycles"
            );
            case "GREEN" -> List.of(
                "Your CV may not be highlighting your strongest signals for " + role,
                "Positioning could be stronger — you're undervaluing transferable experience",
                "Interview prep for " + role + " will be key to converting your experience"
            );
            default -> List.of(
                "Your experience is relevant but may appear outdated for " + role,
                "Skill framing needs work — recruiters need to see clear role alignment",
                "Without fresh examples, your profile may not stand out for " + role
            );
        };
    }

    private String generateTeaser(CareerSession s) {
        return switch (s.getStatus()) {
            case "RED" -> "Week 1: Research the top 5 skills required for " + s.getTargetRole() + " and identify your closest transferable skills";
            case "GREEN" -> "Week 1: Rewrite your CV summary to lead with your " + s.getTargetRole() + " experience and quantified achievements";
            default -> "Week 1: Update your online profiles to reflect current " + s.getTargetRole() + " terminology and frameworks";
        };
    }

    private List<SessionResponse.PlanItem> generatePlan(CareerSession s) {
        String role = s.getTargetRole() != null ? s.getTargetRole() : "target role";
        return List.of(
            new SessionResponse.PlanItem(1, "Foundation",
                "Audit your current skills against " + role + " job postings. Identify the 3 biggest gaps."),
            new SessionResponse.PlanItem(1, "CV Overhaul",
                "Rewrite your CV with " + role + "-specific keywords and quantified achievements."),
            new SessionResponse.PlanItem(2, "Skill Building",
                "Complete a focused course or project in your biggest skill gap for " + role + "."),
            new SessionResponse.PlanItem(2, "Network Activation",
                "Reach out to 5 people currently in " + role + " positions. Ask about their day-to-day."),
            new SessionResponse.PlanItem(3, "Portfolio Prep",
                "Build or document a project that demonstrates your ability to perform in " + role + "."),
            new SessionResponse.PlanItem(3, "Interview Practice",
                "Practice answering the top 10 interview questions for " + role + " with STAR format."),
            new SessionResponse.PlanItem(4, "Application Sprint",
                "Apply to 10-15 targeted " + role + " positions with your optimized materials."),
            new SessionResponse.PlanItem(4, "Review & Iterate",
                "Track response rates and refine your approach based on feedback received.")
        );
    }

    private List<String> generateCvBullets(CareerSession s) {
        String role = s.getTargetRole() != null ? s.getTargetRole() : "this role";
        return List.of(
            "Lead with a summary that positions you specifically for " + role,
            "Quantify achievements — use numbers, percentages, and timeframes",
            "Remove generic soft skills — replace with role-specific technical competencies",
            "Add a 'Key Projects' section showcasing relevant work for " + role
        );
    }

    private List<String> generateRolesToAvoid(CareerSession s) {
        return switch (s.getStatus()) {
            case "RED" -> List.of(
                "Senior positions in the target field without relevant experience",
                "Roles requiring 5+ years of specific domain experience you lack",
                "Contract roles with immediate delivery expectations"
            );
            case "GREEN" -> List.of(
                "Roles significantly below your experience level",
                "Positions in declining or overly commoditized technology areas"
            );
            default -> List.of(
                "Roles that don't leverage your transferable skills",
                "Positions requiring niche certifications you don't have yet",
                "Highly competitive generalist roles with 500+ applicants"
            );
        };
    }

    private String generatePivotSuggestion(CareerSession s) {
        if ("RED".equals(s.getStatus())) {
            return "Consider a stepping-stone role that bridges your current experience to " +
                   s.getTargetRole() + ". Look for hybrid positions or internal transfers.";
        }
        return null;
    }

    // ================= Helpers =================

    private SessionResponse toResponse(CareerSession s) {
        List<String> blockers = fromJson(s.getBlockersJson(), new TypeReference<>() {});
        boolean showPaid = s.isPaid();

        return new SessionResponse(
            s.getId(),
            s.getShareId(),
            s.getMode(),
            s.getTargetRole(),
            s.getStatus(),
            blockers,
            s.getTeaserAction(),
            s.isPaid(),
            showPaid ? fromJson(s.getPlanJson(), new TypeReference<>() {}) : null,
            showPaid ? fromJson(s.getCvRewriteBulletsJson(), new TypeReference<>() {}) : null,
            showPaid ? fromJson(s.getRolesToAvoidJson(), new TypeReference<>() {}) : null,
            showPaid ? s.getPivotSuggestion() : null,
            s.getCreatedAt() != null ? s.getCreatedAt().toString() : null
        );
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Failed to serialize to JSON", e);
            return "[]";
        }
    }

    private <T> T fromJson(String json, TypeReference<T> type) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            log.error("Failed to deserialize JSON", e);
            return null;
        }
    }
}
