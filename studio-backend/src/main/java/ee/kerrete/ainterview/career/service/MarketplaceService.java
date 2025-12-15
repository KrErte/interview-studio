package ee.kerrete.ainterview.career.service;

import ee.kerrete.ainterview.career.dto.MarketplaceSearchResponse;
import ee.kerrete.ainterview.career.model.MarketplaceProfile;
import ee.kerrete.ainterview.career.model.MarketplaceVisibility;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.MarketplaceProfileRepository;
import ee.kerrete.ainterview.career.repository.SkillProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceProfileRepository marketplaceProfileRepository;
    private final SkillProfileRepository skillProfileRepository;

    @Transactional
    public MarketplaceProfile upsertMarketplaceProfile(Long skillProfileId, String headline, Double score, Double overlapPercent) {
        List<MarketplaceProfile> existing = marketplaceProfileRepository.findBySkillProfileId(skillProfileId);
        MarketplaceProfile profile = existing.isEmpty() ? MarketplaceProfile.builder().skillProfileId(skillProfileId).build() : existing.get(0);
        profile.setHeadline(headline);
        profile.setScore(score);
        profile.setOverlapPercent(overlapPercent);
        if (profile.getVisibility() == null) {
            profile.setVisibility(MarketplaceVisibility.LIMITED);
        }
        return marketplaceProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public List<MarketplaceSearchResponse> search(String roleFamily, Double minOverlap, Double minScore, String location) {
        double threshold = minScore == null ? 0.0 : minScore;
        List<MarketplaceProfile> profiles = marketplaceProfileRepository.findByVisibilityNotAndScoreGreaterThanEqual(MarketplaceVisibility.OFF, threshold);
        List<Long> skillIds = profiles.stream().map(MarketplaceProfile::getSkillProfileId).filter(Objects::nonNull).toList();
        List<SkillProfile> skills = skillProfileRepository.findAllById(skillIds);
        return profiles.stream()
            .filter(p -> minOverlap == null || (p.getOverlapPercent() != null && p.getOverlapPercent() >= minOverlap))
            .map(p -> {
                SkillProfile sp = skills.stream().filter(s -> s.getId().equals(p.getSkillProfileId())).findFirst().orElse(null);
                if (sp == null) return null;
                if (StringUtils.hasText(roleFamily) && !roleFamily.equalsIgnoreCase(sp.getRoleFamily())) return null;
                if (StringUtils.hasText(location) && !location.equalsIgnoreCase(sp.getLocation())) return null;
                return MarketplaceSearchResponse.builder()
                    .marketplaceProfileId(p.getId())
                    .skillProfileId(sp.getId())
                    .email(sp.getEmail())
                    .headline(p.getHeadline())
                    .roleFamily(sp.getRoleFamily())
                    .location(sp.getLocation())
                    .score(p.getScore())
                    .overlapPercent(p.getOverlapPercent())
                    .visibility(p.getVisibility())
                    .build();
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(ArrayList::new));
    }
}

