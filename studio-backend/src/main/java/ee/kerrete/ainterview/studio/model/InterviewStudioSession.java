package ee.kerrete.ainterview.studio.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Interview Studio V2 session entity.
 * Supports both guest (simple) and authenticated (advanced) modes.
 */
@Entity
@Table(name = "interview_studio_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewStudioSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Public share ID (UUID) for shareable links.
     * Only populated for authenticated sessions that enable sharing.
     */
    @Column(name = "share_id", unique = true, length = 36)
    private String shareId;

    /**
     * User ID (null for guest sessions).
     */
    @Column(name = "user_id")
    private Long userId;

    /**
     * Session mode: SIMPLE or ADVANCED.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false, length = 20)
    private SessionMode mode;

    /**
     * Target role the user is applying for.
     */
    @Column(name = "target_role", nullable = false)
    private String targetRole;

    // Simple mode fields
    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(name = "main_challenge", length = 100)
    private String mainChallenge;

    // Advanced mode fields
    @Column(name = "last_worked_in_role", length = 50)
    private String lastWorkedInRole;

    @Column(name = "urgency", length = 50)
    private String urgency;

    @Column(name = "main_blocker", length = 100)
    private String mainBlocker;

    @Column(name = "recent_work_examples", columnDefinition = "CLOB")
    private String recentWorkExamples;

    @Column(name = "cv_text", columnDefinition = "CLOB")
    private String cvText;

    // Assessment result
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 10)
    private AssessmentStatus status;

    @Column(name = "blockers_json", columnDefinition = "CLOB")
    private String blockersJson;

    @Column(name = "teaser_action", length = 500)
    private String teaserAction;

    // Paid content
    @Column(name = "is_paid", nullable = false)
    @Builder.Default
    private boolean paid = false;

    @Column(name = "plan_json", columnDefinition = "CLOB")
    private String planJson;

    @Column(name = "cv_rewrite_bullets_json", columnDefinition = "CLOB")
    private String cvRewriteBulletsJson;

    @Column(name = "roles_to_avoid_json", columnDefinition = "CLOB")
    private String rolesToAvoidJson;

    @Column(name = "pivot_suggestion", length = 500)
    private String pivotSuggestion;

    // Payment tracking
    @Column(name = "payment_intent_id", length = 100)
    private String paymentIntentId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // Timestamps
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum SessionMode {
        SIMPLE, ADVANCED
    }

    public enum AssessmentStatus {
        RED, YELLOW, GREEN
    }
}
