package ee.kerrete.ainterview.career.repository;

import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.model.MarketplaceVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillProfileRepository extends JpaRepository<SkillProfile, Long> {
    Optional<SkillProfile> findByEmail(String email);
    List<SkillProfile> findByVisibilityNotAndFutureProofScoreGreaterThanEqual(MarketplaceVisibility visibility, Double score);
}

