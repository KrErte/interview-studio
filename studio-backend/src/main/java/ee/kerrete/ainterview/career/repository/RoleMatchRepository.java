package ee.kerrete.ainterview.career.repository;

import ee.kerrete.ainterview.career.model.RoleMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleMatchRepository extends JpaRepository<RoleMatch, Long> {
    List<RoleMatch> findTop10BySkillProfileIdOrderByOverlapPercentDesc(Long skillProfileId);
}

