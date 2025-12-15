package ee.kerrete.ainterview.repository;

import ee.kerrete.ainterview.model.InterviewSessionEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InterviewSessionEventRepository extends JpaRepository<InterviewSessionEvent, Long> {
    List<InterviewSessionEvent> findTop200BySessionUuidOrderByCreatedAtDesc(UUID sessionUuid);
    List<InterviewSessionEvent> findTop200BySessionUuidAndIdLessThanOrderByCreatedAtDesc(UUID sessionUuid, Long id);
}


