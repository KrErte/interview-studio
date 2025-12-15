package ee.kerrete.ainterview.pivot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pivot_role_match")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PivotRoleMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transition_profile_id", nullable = false)
    private TransitionProfile profile;

    @Column(name = "target_role", nullable = false)
    private String targetRole;

    @Column(name = "match_score", nullable = false)
    private Double matchScore;

    @Column(name = "future_proof_score")
    private Double futureProofScore;

    @Column(name = "gap_summary", columnDefinition = "TEXT")
    private String gapSummary;

    @Column(name = "recommended_actions", columnDefinition = "TEXT")
    private String recommendedActions;

    @Column(name = "computed_at", nullable = false)
    private LocalDateTime computedAt;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;
}


