package ee.kerrete.ainterview.evidence.repository;

import ee.kerrete.ainterview.evidence.model.EvidenceAuditSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for evidence audit snapshots.
 */
public interface EvidenceAuditSnapshotRepository extends JpaRepository<EvidenceAuditSnapshot, UUID> {

    /**
     * Find all audit snapshots for a user, ordered by created_at descending.
     */
    List<EvidenceAuditSnapshot> findByEmailOrderByCreatedAtDesc(String email);

    /**
     * Find the latest audit snapshot for a user.
     */
    EvidenceAuditSnapshot findFirstByEmailOrderByCreatedAtDesc(String email);
}
