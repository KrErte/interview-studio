package ee.kerrete.ainterview.repository;

import ee.kerrete.ainterview.model.CandidateCv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CandidateCvRepository extends JpaRepository<CandidateCv, Long> {
    List<CandidateCv> findBySessionUuidOrderByCreatedAtDesc(UUID sessionUuid);
}



