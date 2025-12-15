package ee.kerrete.ainterview.career.repository;

import ee.kerrete.ainterview.career.model.FutureProofScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FutureProofScoreRepository extends JpaRepository<FutureProofScore, Long> {
    List<FutureProofScore> findTop5BySkillProfileIdOrderByCreatedAtDesc(Long skillProfileId);
}

