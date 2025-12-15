package ee.kerrete.ainterview.career.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "skill_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Logical key for the candidate.
     */
    @Column(nullable = false)
    private String email;

    @Column(name = "role_family")
    private String roleFamily;

    private String location;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Lob
    @Column(name = "skills_json")
    private String skillsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", length = 20, nullable = false)
    private MarketplaceVisibility visibility;

    @Column(name = "future_proof_score")
    private Double futureProofScore;

    @Lob
    @Column(name = "future_proof_explain_json")
    private String futureProofExplainJson;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (visibility == null) visibility = MarketplaceVisibility.LIMITED;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

