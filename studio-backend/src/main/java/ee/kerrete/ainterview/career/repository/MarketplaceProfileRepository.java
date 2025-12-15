package ee.kerrete.ainterview.career.repository;

import ee.kerrete.ainterview.career.model.MarketplaceProfile;
import ee.kerrete.ainterview.career.model.MarketplaceVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketplaceProfileRepository extends JpaRepository<MarketplaceProfile, Long> {
    List<MarketplaceProfile> findByVisibilityNotAndScoreGreaterThanEqual(MarketplaceVisibility visibility, Double score);
    List<MarketplaceProfile> findBySkillProfileId(Long skillProfileId);
}

