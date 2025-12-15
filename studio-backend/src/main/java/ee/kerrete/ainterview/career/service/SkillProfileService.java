package ee.kerrete.ainterview.career.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.career.dto.SkillProfileDto;
import ee.kerrete.ainterview.career.model.MarketplaceVisibility;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.SkillProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SkillProfileService {

    private final SkillProfileRepository repository;
    private final ObjectMapper objectMapper;

    @Transactional
    public SkillProfile upsert(String email, String roleFamily, String location, Integer yearsExperience, List<String> skills, MarketplaceVisibility visibility) {
        SkillProfile profile = repository.findByEmail(email).orElse(SkillProfile.builder().email(email).build());
        profile.setRoleFamily(roleFamily);
        profile.setLocation(location);
        profile.setYearsExperience(yearsExperience);
        profile.setSkillsJson(writeSkills(skills));
        if (visibility != null) {
            profile.setVisibility(visibility);
        } else if (profile.getVisibility() == null) {
            profile.setVisibility(MarketplaceVisibility.LIMITED);
        }
        return repository.save(profile);
    }

    @Transactional(readOnly = true)
    public Optional<SkillProfile> find(Long id) {
        return repository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<SkillProfile> findByEmail(String email) {
        return repository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<String> readSkills(SkillProfile profile) {
        if (profile == null || !StringUtils.hasText(profile.getSkillsJson())) {
            return List.of();
        }
        try {
            return objectMapper.readValue(profile.getSkillsJson(), objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return List.of();
        }
    }

    private String writeSkills(List<String> skills) {
        List<String> safe = skills == null ? new ArrayList<>() : skills.stream()
            .filter(StringUtils::hasText)
            .map(s -> s.toLowerCase().trim())
            .distinct()
            .toList();
        try {
            return objectMapper.writeValueAsString(safe);
        } catch (Exception e) {
            return "[]";
        }
    }

    @Transactional(readOnly = true)
    public SkillProfileDto toDto(SkillProfile profile) {
        if (profile == null) return null;
        return SkillProfileDto.builder()
            .id(profile.getId())
            .email(profile.getEmail())
            .roleFamily(profile.getRoleFamily())
            .location(profile.getLocation())
            .yearsExperience(profile.getYearsExperience())
            .skills(readSkills(profile))
            .visibility(profile.getVisibility())
            .futureProofScore(profile.getFutureProofScore())
            .build();
    }
}

