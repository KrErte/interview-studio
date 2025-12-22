package ee.kerrete.ainterview.evidence.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a piece of evidence logged by a user.
 * Evidence decays over time based on last_anchored_at timestamp.
 * Evidence is never deleted by decay; only weight is computed.
 */
@Entity
@Table(name = "evidence_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, columnDefinition = "CLOB")
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_anchored_at", nullable = false)
    private LocalDateTime lastAnchoredAt;

    @Column(name = "anchor_count", nullable = false)
    @Builder.Default
    private int anchorCount = 0;

    @Column(name = "detected_category")
    private String detectedCategory;

    @Column(name = "extracted_verbs", columnDefinition = "CLOB")
    private String extractedVerbs;

    @Column(name = "extracted_entities", columnDefinition = "CLOB")
    private String extractedEntities;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (lastAnchoredAt == null) {
            lastAnchoredAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
