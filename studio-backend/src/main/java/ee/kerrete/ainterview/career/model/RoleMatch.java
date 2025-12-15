package ee.kerrete.ainterview.career.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_match")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_profile_id", nullable = false)
    private Long skillProfileId;

    @Column(name = "role_profile_id", nullable = false)
    private Long roleProfileId;

    @Column(name = "overlap_percent")
    private Double overlapPercent;

    @Lob
    @Column(name = "gap_skills_json")
    private String gapSkillsJson;

    @Column(name = "estimated_weeks")
    private Integer estimatedWeeks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

