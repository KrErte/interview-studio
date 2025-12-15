package ee.kerrete.ainterview.career;

import ee.kerrete.ainterview.AbstractIntegrationTest;
import ee.kerrete.ainterview.career.dto.FutureProofScoreRequest;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.FutureProofScoreRepository;
import ee.kerrete.ainterview.career.repository.SkillProfileRepository;
import ee.kerrete.ainterview.career.service.FutureProofScoreService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class FutureProofScoreServiceTest extends AbstractIntegrationTest {

    @Autowired
    private FutureProofScoreService futureProofScoreService;

    @Autowired
    private SkillProfileRepository skillProfileRepository;

    @Autowired
    private FutureProofScoreRepository futureProofScoreRepository;

    @Test
    void computesAndPersistsScore() {
        SkillProfile profile = skillProfileRepository.save(SkillProfile.builder()
            .email("score@example.com")
            .skillsJson("[\"java\",\"spring\",\"aws\"]")
            .yearsExperience(6)
            .build());

        FutureProofScoreRequest req = new FutureProofScoreRequest();
        req.setSkillProfileId(profile.getId());
        req.setSkills(List.of("java", "spring", "aws", "docker"));
        req.setYearsExperience(6);

        var dto = futureProofScoreService.computeAndPersist(req);

        SkillProfile reloaded = skillProfileRepository.findById(profile.getId()).orElseThrow();
        assertThat(reloaded.getFutureProofScore()).isNotNull();
        assertThat(dto.getScore()).isEqualTo(reloaded.getFutureProofScore());
        assertThat(futureProofScoreRepository.findTop5BySkillProfileIdOrderByCreatedAtDesc(profile.getId()))
            .isNotEmpty();
    }
}

