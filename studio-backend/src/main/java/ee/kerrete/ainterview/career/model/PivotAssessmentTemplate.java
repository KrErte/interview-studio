package ee.kerrete.ainterview.career.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "pivot_assessment_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PivotAssessmentTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_family", nullable = false)
    private String roleFamily;

    @Column(name = "weight_core")
    private Double weightCore;

    @Column(name = "weight_gap")
    private Double weightGap;

    @Lob
    @Column(name = "baseline_skills_json")
    private String baselineSkillsJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

