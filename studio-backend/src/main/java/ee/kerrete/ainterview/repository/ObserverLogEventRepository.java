package ee.kerrete.ainterview.repository;

import ee.kerrete.ainterview.model.ObserverLogEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ObserverLogEventRepository extends JpaRepository<ObserverLogEvent, UUID> {
    List<ObserverLogEvent> findBySessionUuidOrderByCreatedAtAsc(UUID sessionUuid);
}

