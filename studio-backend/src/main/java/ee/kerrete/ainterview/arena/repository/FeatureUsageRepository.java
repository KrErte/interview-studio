package ee.kerrete.ainterview.arena.repository;

import ee.kerrete.ainterview.arena.model.FeatureUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface FeatureUsageRepository extends JpaRepository<FeatureUsage, Long> {
    long countByUserIdAndFeatureAndUsedAtAfter(Long userId, String feature, LocalDateTime after);
}
