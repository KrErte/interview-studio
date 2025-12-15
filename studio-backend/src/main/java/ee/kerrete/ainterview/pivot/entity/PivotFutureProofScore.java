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
@Table(name = "pivot_future_proof_score")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PivotFutureProofScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transition_profile_id", nullable = false)
    private TransitionProfile profile;

    @Column(name = "overall_score", nullable = false)
    private Double overallScore;

    @Column(name = "adaptability_score")
    private Double adaptabilityScore;

    @Column(name = "skill_relevance_score")
    private Double skillRelevanceScore;

    @Column(name = "market_demand_score")
    private Double marketDemandScore;

    @Column(name = "stability_score")
    private Double stabilityScore;

    @Column(name = "source_event_id")
    private UUID sourceEventId;

    @Column(name = "computed_at", nullable = false)
    private LocalDateTime computedAt;
}


