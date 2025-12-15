package ee.kerrete.ainterview.pivot.entity;

import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "transition_profile")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransitionProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "jobseeker_user_id", nullable = false)
    private AppUser jobseeker;

    @Column(name = "current_role")
    private String currentRole;

    @Column(name = "target_role")
    private String targetRole;

    @Column(name = "skills_json", columnDefinition = "TEXT")
    private String skillsJson;

    @Column(name = "preferred_locations")
    private String preferredLocations;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    @Builder.Default
    private VisibilityLevel visibility = VisibilityLevel.OFF;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

