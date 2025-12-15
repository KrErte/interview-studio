package ee.kerrete.ainterview.pivot.entity;

import ee.kerrete.ainterview.pivot.enums.ScoreTriggerType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "future_proof_score_event")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FutureProofScoreEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, unique = true)
    private UUID eventId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transition_profile_id", nullable = false)
    private TransitionProfile profile;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false)
    private ScoreTriggerType triggerType;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(name = "computed_score")
    private Double computedScore;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

