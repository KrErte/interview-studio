package ee.kerrete.ainterview.career;

import ee.kerrete.ainterview.AbstractIntegrationTest;
import ee.kerrete.ainterview.career.dto.CareerRiskScoreRequest;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.CareerRiskScoreRepository;
import ee.kerrete.ainterview.career.repository.SkillProfileRepository;
import ee.kerrete.ainterview.career.service.CareerRiskScoreService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class CareerRiskScoreServiceTest extends AbstractIntegrationTest {

    @Autowired
    private CareerRiskScoreService careerRiskScoreService;

    @Autowired
    private SkillProfileRepository skillProfileRepository;

    @Autowired
    private CareerRiskScoreRepository careerRiskScoreRepository;

    @Test
    void computesAndPersistsScore() {
        SkillProfile profile = skillProfileRepository.save(SkillProfile.builder()
            .email("score@example.com")
            .skillsJson("[\"java\",\"spring\",\"aws\"]")
            .yearsExperience(6)
            .build());

        CareerRiskScoreRequest req = new CareerRiskScoreRequest();
        req.setSkillProfileId(profile.getId());
        req.setSkills(List.of("java", "spring", "aws", "docker"));
        req.setYearsExperience(6);

        var dto = careerRiskScoreService.computeAndPersist(req);

        SkillProfile reloaded = skillProfileRepository.findById(profile.getId()).orElseThrow();
        assertThat(reloaded.getCareerRiskScore()).isNotNull();
        assertThat(dto.getScore()).isEqualTo(reloaded.getCareerRiskScore());
        assertThat(careerRiskScoreRepository.findTop5BySkillProfileIdOrderByCreatedAtDesc(profile.getId()))
            .isNotEmpty();
    }
}

