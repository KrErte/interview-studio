package ee.kerrete.ainterview.repository;

import ee.kerrete.ainterview.model.CareerSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CareerSessionRepository extends JpaRepository<CareerSession, Long> {
    Optional<CareerSession> findByShareId(String shareId);
    List<CareerSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
