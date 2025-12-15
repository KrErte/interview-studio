package ee.kerrete.ainterview.pivot.repository;

import ee.kerrete.ainterview.pivot.entity.FutureProofScoreEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FutureProofScoreEventRepository extends JpaRepository<FutureProofScoreEvent, Long> {
    boolean existsByEventId(UUID eventId);
}

