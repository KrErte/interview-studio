package ee.kerrete.ainterview.career;

import ee.kerrete.ainterview.AbstractIntegrationTest;
import ee.kerrete.ainterview.career.model.MarketplaceProfile;
import ee.kerrete.ainterview.career.model.MarketplaceVisibility;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.MarketplaceProfileRepository;
import ee.kerrete.ainterview.career.repository.SkillProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class MarketplaceSearchControllerIT extends AbstractIntegrationTest {

    @Autowired
    private SkillProfileRepository skillProfileRepository;

    @Autowired
    private MarketplaceProfileRepository marketplaceProfileRepository;

    @Test
    void excludesOffVisibilityAndAppliesScoreFilter() throws Exception {
        SkillProfile visible = skillProfileRepository.save(SkillProfile.builder()
            .email("visible@example.com")
            .roleFamily("ENGINEERING")
            .location("Tallinn")
            .visibility(MarketplaceVisibility.PUBLIC)
            .futureProofScore(78.0)
            .build());
        marketplaceProfileRepository.save(MarketplaceProfile.builder()
            .skillProfileId(visible.getId())
            .headline("Visible candidate")
            .score(78.0)
            .overlapPercent(65.0)
            .visibility(MarketplaceVisibility.PUBLIC)
            .build());

        SkillProfile hidden = skillProfileRepository.save(SkillProfile.builder()
            .email("hidden@example.com")
            .roleFamily("ENGINEERING")
            .location("Tallinn")
            .visibility(MarketplaceVisibility.OFF)
            .futureProofScore(90.0)
            .build());
        marketplaceProfileRepository.save(MarketplaceProfile.builder()
            .skillProfileId(hidden.getId())
            .headline("Hidden candidate")
            .score(95.0)
            .overlapPercent(90.0)
            .visibility(MarketplaceVisibility.OFF)
            .build());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/marketplace/search")
                .param("minScore", "70")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].email").value("visible@example.com"));
    }
}

