package ee.kerrete.ainterview.evidence.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a point-in-time snapshot of user evidence health.
 * Used for quarterly "Silent Audit" summaries.
 */
@Entity
@Table(name = "evidence_audit_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceAuditSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "exposure_score", precision = 10, scale = 4)
    private BigDecimal exposureScore;

    @Column(name = "evidence_count", nullable = false)
    private int evidenceCount;

    @Column(name = "simulated_score_without_oldest_3", precision = 10, scale = 4)
    private BigDecimal simulatedScoreWithoutOldest3;

    @Column(columnDefinition = "CLOB")
    private String notes;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
