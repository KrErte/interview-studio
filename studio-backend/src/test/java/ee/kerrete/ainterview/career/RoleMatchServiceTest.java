package ee.kerrete.ainterview.career;

import ee.kerrete.ainterview.career.dto.RoleMatchRequest;
import ee.kerrete.ainterview.career.model.RoleProfile;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.RoleMatchRepository;
import ee.kerrete.ainterview.career.repository.RoleProfileRepository;
import ee.kerrete.ainterview.career.repository.SkillProfileRepository;
import ee.kerrete.ainterview.career.service.RoleMatchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.profiles.active=test")
@Transactional
public class RoleMatchServiceTest {

    @Autowired
    private RoleMatchService roleMatchService;

    @Autowired
    private RoleProfileRepository roleProfileRepository;

    @Autowired
    private SkillProfileRepository skillProfileRepository;

    @Autowired
    private RoleMatchRepository roleMatchRepository;

    @Test
    void computesMatchesAndPersistsRoleMatch() {
        SkillProfile profile = skillProfileRepository.save(SkillProfile.builder()
            .email("match@example.com")
            .skillsJson("[\"java\",\"spring\",\"docker\"]")
            .build());

        roleProfileRepository.save(RoleProfile.builder()
            .roleKey("java_backend")
            .roleName("Java Backend Engineer")
            .roleFamily("ENGINEERING")
            .requiredSkillsJson("[\"java\",\"spring\",\"kubernetes\"]")
            .build());

        RoleMatchRequest req = new RoleMatchRequest();
        req.setSkillProfileId(profile.getId());
        var matches = roleMatchService.compute(req);

        assertThat(matches).isNotEmpty();
        assertThat(matches.get(0).getGapSkills()).contains("kubernetes");
        assertThat(roleMatchRepository.findTop10BySkillProfileIdOrderByOverlapPercentDesc(profile.getId())).isNotEmpty();
    }
}

