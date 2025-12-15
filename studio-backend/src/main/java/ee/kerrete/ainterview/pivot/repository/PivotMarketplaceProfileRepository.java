package ee.kerrete.ainterview.pivot.repository;

import ee.kerrete.ainterview.pivot.entity.PivotMarketplaceProfile;
import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PivotMarketplaceProfileRepository extends JpaRepository<PivotMarketplaceProfile, Long> {

    Optional<PivotMarketplaceProfile> findByProfileId(Long profileId);

    List<PivotMarketplaceProfile> findByVisibilityIn(Collection<VisibilityLevel> visibilities);
}

