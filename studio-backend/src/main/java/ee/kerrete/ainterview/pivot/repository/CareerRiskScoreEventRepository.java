package ee.kerrete.ainterview.pivot.repository;

import ee.kerrete.ainterview.pivot.entity.CareerRiskScoreEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CareerRiskScoreEventRepository extends JpaRepository<CareerRiskScoreEvent, Long> {
    boolean existsByEventId(UUID eventId);
}

