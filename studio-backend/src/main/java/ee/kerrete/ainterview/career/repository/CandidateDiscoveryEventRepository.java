package ee.kerrete.ainterview.career.repository;

import ee.kerrete.ainterview.career.model.CandidateDiscoveryEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateDiscoveryEventRepository extends JpaRepository<CandidateDiscoveryEvent, Long> {
}

