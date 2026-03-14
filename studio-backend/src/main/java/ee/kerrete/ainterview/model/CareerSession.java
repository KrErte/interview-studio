package ee.kerrete.ainterview.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_studio_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(name = "share_id", unique = true, length = 36)
    private String shareId = UUID.randomUUID().toString();

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 20)
    private String mode; // SIMPLE or ADVANCED

    @Column(name = "target_role", nullable = false)
    private String targetRole;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(name = "last_worked_in_role", length = 50)
    private String lastWorkedInRole;

    @Column(length = 50)
    private String urgency;

    @Column(name = "main_challenge", length = 100)
    private String mainChallenge;

    @Column(name = "main_blocker", length = 100)
    private String mainBlocker;

    @Lob
    @Column(name = "recent_work_examples", columnDefinition = "CLOB")
    private String recentWorkExamples;

    @Lob
    @Column(name = "cv_text", columnDefinition = "CLOB")
    private String cvText;

    // Assessment result
    @Column(length = 10)
    private String status; // RED, YELLOW, GREEN

    @Lob
    @Column(name = "blockers_json", columnDefinition = "CLOB")
    private String blockersJson;

    @Column(name = "teaser_action", length = 500)
    private String teaserAction;

    // Paid content
    @Builder.Default
    @Column(name = "is_paid", nullable = false)
    private boolean paid = false;

    @Lob
    @Column(name = "plan_json", columnDefinition = "CLOB")
    private String planJson;

    @Lob
    @Column(name = "cv_rewrite_bullets_json", columnDefinition = "CLOB")
    private String cvRewriteBulletsJson;

    @Lob
    @Column(name = "roles_to_avoid_json", columnDefinition = "CLOB")
    private String rolesToAvoidJson;

    @Column(name = "pivot_suggestion", length = 500)
    private String pivotSuggestion;

    @Column(name = "payment_intent_id", length = 100)
    private String paymentIntentId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (shareId == null) shareId = UUID.randomUUID().toString();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
