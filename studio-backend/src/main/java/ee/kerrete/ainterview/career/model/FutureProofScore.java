package ee.kerrete.ainterview.career.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "future_proof_score")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FutureProofScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_profile_id", nullable = false)
    private Long skillProfileId;

    @Column(name = "score")
    private Double score;

    @Lob
    @Column(name = "explain_json")
    private String explainJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

