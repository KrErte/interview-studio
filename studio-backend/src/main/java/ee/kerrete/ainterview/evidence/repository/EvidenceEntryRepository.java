package ee.kerrete.ainterview.evidence.repository;

import ee.kerrete.ainterview.evidence.model.EvidenceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for evidence entries.
 */
public interface EvidenceEntryRepository extends JpaRepository<EvidenceEntry, UUID> {

    /**
     * Find all evidence entries for a user, ordered by last anchored descending.
     */
    List<EvidenceEntry> findByEmailOrderByLastAnchoredAtDesc(String email);

    /**
     * Find all evidence entries for a user, ordered by created_at ascending.
     */
    List<EvidenceEntry> findByEmailOrderByCreatedAtAsc(String email);

    /**
     * Find a specific evidence entry by id and email (for ownership check).
     */
    Optional<EvidenceEntry> findByIdAndEmail(UUID id, String email);

    /**
     * Count evidence entries for a user.
     */
    long countByEmail(String email);

    /**
     * Find the oldest 3 evidence entries by last_anchored_at for a user.
     */
    @Query("SELECT e FROM EvidenceEntry e WHERE e.email = :email ORDER BY e.lastAnchoredAt ASC LIMIT 3")
    List<EvidenceEntry> findOldest3ByEmail(@Param("email") String email);
}
