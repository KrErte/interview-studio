package ee.kerrete.ainterview.career.repository;

import ee.kerrete.ainterview.career.model.CareerRiskScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CareerRiskScoreRepository extends JpaRepository<CareerRiskScore, Long> {
    List<CareerRiskScore> findTop5BySkillProfileIdOrderByCreatedAtDesc(Long skillProfileId);
}

