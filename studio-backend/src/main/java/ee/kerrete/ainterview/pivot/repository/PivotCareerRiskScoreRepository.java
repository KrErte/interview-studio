package ee.kerrete.ainterview.pivot.repository;

import ee.kerrete.ainterview.pivot.entity.PivotCareerRiskScore;
import ee.kerrete.ainterview.pivot.entity.TransitionProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PivotCareerRiskScoreRepository extends JpaRepository<PivotCareerRiskScore, Long> {
    Optional<PivotCareerRiskScore> findTopByProfileOrderByComputedAtDesc(TransitionProfile profile);
}

