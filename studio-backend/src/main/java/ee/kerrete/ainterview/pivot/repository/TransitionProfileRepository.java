package ee.kerrete.ainterview.pivot.repository;

import ee.kerrete.ainterview.pivot.entity.TransitionProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransitionProfileRepository extends JpaRepository<TransitionProfile, Long> {
    Optional<TransitionProfile> findByJobseekerId(Long jobseekerId);
}

