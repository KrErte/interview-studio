package ee.kerrete.ainterview.career.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.career.dto.FutureProofScoreDto;
import ee.kerrete.ainterview.career.dto.FutureProofScoreRequest;
import ee.kerrete.ainterview.career.model.FutureProofScore;
import ee.kerrete.ainterview.career.model.SkillProfile;
import ee.kerrete.ainterview.career.repository.FutureProofScoreRepository;
import ee.kerrete.ainterview.career.repository.SkillProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("careerFutureProofScoreService")
@RequiredArgsConstructor
public class FutureProofScoreService {

    private final SkillProfileRepository skillProfileRepository;
    private final FutureProofScoreRepository futureProofScoreRepository;
    private final SkillProfileService skillProfileService;
    private final ObjectMapper objectMapper;

    @Transactional
    public FutureProofScoreDto computeAndPersist(FutureProofScoreRequest request) {
        SkillProfile profile = resolveProfile(request);
        List<String> skills = resolveSkills(request, profile);
        int skillCount = Math.min(30, skills.size());
        int years = request.getYearsExperience() != null ? request.getYearsExperience() : profile.getYearsExperience() == null ? 0 : profile.getYearsExperience();

        double base = 40.0;
        double skillComponent = skillCount * 1.5; // up to 45
        double yearsComponent = Math.min(15, years) * 1.5; // up to 22.5
        double diversification = Math.min(15, distinctLettersRatio(skills) * 15); // up to 15

        double score = Math.min(100.0, Math.round((base + skillComponent + yearsComponent + diversification) * 10.0) / 10.0);

        Map<String, Object> explain = new HashMap<>();
        explain.put("skillCount", skillCount);
        explain.put("yearsExperience", years);
        explain.put("base", base);
        explain.put("skillComponent", skillComponent);
        explain.put("yearsComponent", yearsComponent);
        explain.put("diversification", diversification);
        explain.put("score", score);

        String explainJson = writeJson(explain);

        FutureProofScore record = FutureProofScore.builder()
            .skillProfileId(profile.getId())
            .score(score)
            .explainJson(explainJson)
            .build();
        futureProofScoreRepository.save(record);

        profile.setFutureProofScore(score);
        profile.setFutureProofExplainJson(explainJson);
        skillProfileRepository.save(profile);

        return FutureProofScoreDto.builder()
            .skillProfileId(profile.getId())
            .score(score)
            .explainJson(explainJson)
            .computedAt(record.getCreatedAt())
            .build();
    }

    private SkillProfile resolveProfile(FutureProofScoreRequest request) {
        if (request.getSkillProfileId() != null) {
            return skillProfileRepository.findById(request.getSkillProfileId())
                .orElseThrow(() -> new IllegalArgumentException("SkillProfile not found: " + request.getSkillProfileId()));
        }
        if (!StringUtils.hasText(request.getEmail())) {
            throw new IllegalArgumentException("email or skillProfileId is required");
        }
        return skillProfileRepository.findByEmail(request.getEmail())
            .orElseGet(() -> skillProfileRepository.save(SkillProfile.builder()
                .email(request.getEmail())
                .roleFamily(request.getRoleFamily())
                .yearsExperience(request.getYearsExperience())
                .skillsJson(writeJson(request.getSkills()))
                .visibility(request.getSkills() == null ? null : null)
                .build()));
    }

    private List<String> resolveSkills(FutureProofScoreRequest request, SkillProfile profile) {
        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            return request.getSkills();
        }
        return skillProfileService.readSkills(profile);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Map.of() : value);
        } catch (Exception e) {
            return "{}";
        }
    }

    private double distinctLettersRatio(List<String> skills) {
        if (skills == null || skills.isEmpty()) return 0.0;
        long letters = skills.stream().filter(StringUtils::hasText).flatMap(s -> s.chars().mapToObj(c -> (char) c)).count();
        long distinct = skills.stream().filter(StringUtils::hasText).flatMap(s -> s.chars().mapToObj(c -> (char) c)).distinct().count();
        if (letters == 0) return 0.0;
        return (double) distinct / (double) letters;
    }
}
