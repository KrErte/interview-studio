package ee.kerrete.ainterview.career.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.career.dto.RoleMatchDto;
import ee.kerrete.ainterview.career.dto.RoleMatchRequest;
import ee.kerrete.ainterview.career.model.RoleMatch;
import ee.kerrete.ainterview.career.model.RoleProfile;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.RoleMatchRepository;
import ee.kerrete.ainterview.career.repository.RoleProfileRepository;
import ee.kerrete.ainterview.career.repository.SkillProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleMatchService {

    private final SkillProfileRepository skillProfileRepository;
    private final SkillProfileService skillProfileService;
    private final RoleProfileRepository roleProfileRepository;
    private final RoleMatchRepository roleMatchRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<RoleMatchDto> compute(RoleMatchRequest request) {
        SkillProfile profile = resolveProfile(request);
        List<String> candidateSkills = skillProfileService.readSkills(profile).stream()
            .map(String::toLowerCase)
            .toList();

        List<RoleProfile> roles = selectRoles(request);
        List<RoleMatchDto> result = new ArrayList<>();

        for (RoleProfile role : roles) {
            List<String> required = readSkills(role.getRequiredSkillsJson());
            if (required.isEmpty()) continue;
            Set<String> requiredSet = required.stream().map(String::toLowerCase).collect(Collectors.toCollection(LinkedHashSet::new));
            Set<String> strengths = candidateSkills.stream().filter(requiredSet::contains).collect(Collectors.toCollection(LinkedHashSet::new));
            Set<String> gaps = requiredSet.stream().filter(s -> !strengths.contains(s)).collect(Collectors.toCollection(LinkedHashSet::new));

            double overlap = requiredSet.isEmpty() ? 0.0 : (double) strengths.size() / requiredSet.size();
            if (request.getMinOverlap() != null && overlap < request.getMinOverlap()) {
                continue;
            }
            int estimatedWeeks = gaps.size() * 2;

            RoleMatch match = RoleMatch.builder()
                .skillProfileId(profile.getId())
                .roleProfileId(role.getId())
                .overlapPercent(Math.round(overlap * 1000.0) / 10.0)
                .gapSkillsJson(writeJson(gaps))
                .estimatedWeeks(estimatedWeeks)
                .build();
            roleMatchRepository.save(match);

            result.add(RoleMatchDto.builder()
                .roleProfileId(role.getId())
                .roleName(role.getRoleName())
                .roleFamily(role.getRoleFamily())
                .overlapPercent(match.getOverlapPercent())
                .gapSkills(new ArrayList<>(gaps))
                .estimatedWeeks(estimatedWeeks)
                .source("computed")
                .build());
        }

        result.sort(Comparator.comparing(RoleMatchDto::getOverlapPercent, Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    private SkillProfile resolveProfile(RoleMatchRequest request) {
        if (request.getSkillProfileId() != null) {
            return skillProfileRepository.findById(request.getSkillProfileId())
                .orElseThrow(() -> new IllegalArgumentException("SkillProfile not found: " + request.getSkillProfileId()));
        }
        if (!StringUtils.hasText(request.getEmail())) {
            throw new IllegalArgumentException("email or skillProfileId is required");
        }
        return skillProfileRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("SkillProfile not found for email: " + request.getEmail()));
    }

    private List<RoleProfile> selectRoles(RoleMatchRequest request) {
        if (request.getTargetRequiredSkills() != null && !request.getTargetRequiredSkills().isEmpty()) {
            RoleProfile adHoc = RoleProfile.builder()
                .id(-1L)
                .roleKey("adhoc")
                .roleName("Target role")
                .roleFamily(request.getTargetRoleFamily())
                .requiredSkillsJson(writeJson(request.getTargetRequiredSkills()))
                .build();
            return List.of(adHoc);
        }
        if (StringUtils.hasText(request.getTargetRoleFamily())) {
            List<RoleProfile> roles = roleProfileRepository.findByRoleFamily(request.getTargetRoleFamily());
            if (!roles.isEmpty()) return roles;
        }
        return roleProfileRepository.findAll();
    }

    private List<String> readSkills(String json) {
        if (!StringUtils.hasText(json)) return List.of();
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return List.of();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? List.of() : value);
        } catch (Exception e) {
            return "[]";
        }
    }
}

