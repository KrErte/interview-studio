package ee.kerrete.ainterview.studio.repository;

import ee.kerrete.ainterview.studio.model.InterviewStudioSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Interview Studio sessions.
 */
@Repository
public interface InterviewStudioSessionRepository extends JpaRepository<InterviewStudioSession, Long> {

    /**
     * Find all sessions for a user, ordered by creation date descending.
     */
    List<InterviewStudioSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find a session by its public share ID.
     */
    Optional<InterviewStudioSession> findByShareId(String shareId);

    /**
     * Count sessions for a user.
     */
    long countByUserId(Long userId);
}
