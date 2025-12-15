package ee.kerrete.ainterview.career.repository;

import ee.kerrete.ainterview.career.model.PivotAssessmentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PivotAssessmentTemplateRepository extends JpaRepository<PivotAssessmentTemplate, Long> {
    Optional<PivotAssessmentTemplate> findByRoleFamily(String roleFamily);
}

