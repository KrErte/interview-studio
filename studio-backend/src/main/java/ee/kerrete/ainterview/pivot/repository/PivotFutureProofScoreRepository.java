package ee.kerrete.ainterview.pivot.repository;

import ee.kerrete.ainterview.pivot.entity.PivotFutureProofScore;
import ee.kerrete.ainterview.pivot.entity.TransitionProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PivotFutureProofScoreRepository extends JpaRepository<PivotFutureProofScore, Long> {
    Optional<PivotFutureProofScore> findTopByProfileOrderByComputedAtDesc(TransitionProfile profile);
}

