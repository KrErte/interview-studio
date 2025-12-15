package ee.kerrete.ainterview.pivot.repository;

import ee.kerrete.ainterview.pivot.entity.PivotRoleMatch;
import ee.kerrete.ainterview.pivot.entity.TransitionProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PivotRoleMatchRepository extends JpaRepository<PivotRoleMatch, Long> {

    List<PivotRoleMatch> findByProfileIdOrderByComputedAtDesc(Long profileId);

    Optional<PivotRoleMatch> findTopByProfileOrderByComputedAtDesc(TransitionProfile profile);
}

