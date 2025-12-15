package ee.kerrete.ainterview.interview.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.interview.dto.InterviewProfileDto;
import ee.kerrete.ainterview.model.CandidateCv;
import ee.kerrete.ainterview.model.InterviewSession;
import ee.kerrete.ainterview.model.InterviewSessionEventType;
import ee.kerrete.ainterview.repository.CandidateCvRepository;
import ee.kerrete.ainterview.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewProfileService {

    private final CandidateCvRepository candidateCvRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final CvTextExtractService cvTextExtractService;
    private final InterviewAuditService interviewAuditService;
    private final ObjectMapper objectMapper;

    private static final Pattern YEARS_PATTERN = Pattern.compile("(\\d+)\\s+(years|year|yrs|yoe)", Pattern.CASE_INSENSITIVE);
    private static final Set<String> ROLE_FOCUS_BACKEND = Set.of("backend", "back-end", "java", "spring", "node", "api");
    private static final Set<String> ROLE_FOCUS_FRONTEND = Set.of("frontend", "front-end", "react", "angular", "typescript", "javascript", "ui");
    private static final Set<String> ROLE_FOCUS_FULLSTACK = Set.of("fullstack", "full-stack");
    private static final Set<String> SENIOR_TITLES = Set.of("senior", "lead", "principal", "staff", "architect");
    private static final Set<String> BUZZWORDS = Set.of("synergy", "pivot", "leverage", "disrupt", "transformational");

    @Transactional
    public InterviewProfileDto uploadAndBuild(UUID sessionUuid, MultipartFile file) {
        InterviewSession session = interviewSessionRepository.findBySessionUuid(sessionUuid)
            .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionUuid));

        String filename = file == null ? null : file.getOriginalFilename();
        String text = cvTextExtractService.extractText(file);
        Map<String, Object> parsed = parseCv(text, filename);
        InterviewProfileDto profile = buildProfile(text, parsed, session, filename, LocalDateTime.now());

        CandidateCv cv = CandidateCv.builder()
            .sessionUuid(sessionUuid)
            .originalFilename(filename)
            .extractedText(text)
            .parsedJson(writeJson(parsed))
            .createdAt(LocalDateTime.now())
            .build();
        candidateCvRepository.save(cv);

        session.setInterviewProfileJson(writeJson(profile));
        interviewSessionRepository.save(session);

        interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.CV_UPLOADED, Map.of(
            "filename", filename,
            "bytes", file == null ? 0 : file.getSize()
        ));
        interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.CV_PARSED, Map.of(
            "claimedSkills", profile.getClaimedSkills(),
            "experienceYearsEstimate", profile.getExperienceYearsEstimate(),
            "roleFocus", profile.getRoleFocus()
        ));
        interviewAuditService.appendEvent(sessionUuid, InterviewSessionEventType.INTERVIEW_PROFILE_CREATED, Map.of(
            "probePriorities", profile.getProbePriorities(),
            "strengthHypothesesCount", size(profile.getStrengthHypotheses()),
            "riskHypothesesCount", size(profile.getRiskHypotheses())
        ));
        return profile;
    }

    @Transactional(readOnly = true)
    public InterviewProfileDto loadProfile(UUID sessionUuid) {
        InterviewSession session = interviewSessionRepository.findBySessionUuid(sessionUuid)
            .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionUuid));
        return readProfile(session.getInterviewProfileJson());
    }

    @Transactional(readOnly = true)
    public InterviewProfileDto preview(MultipartFile file) {
        String filename = file == null ? null : file.getOriginalFilename();
        String text = cvTextExtractService.extractText(file);
        Map<String, Object> parsed = parseCv(text, filename);
        return buildProfile(text, parsed, null, filename, LocalDateTime.now());
    }

    private Map<String, Object> parseCv(String text, String filename) {
        Map<String, Object> parsed = new LinkedHashMap<>();
        parsed.put("filename", filename);
        parsed.put("extractedLength", text == null ? 0 : text.length());
        parsed.put("lines", text == null ? List.of() : Arrays.stream(text.split("\\R")).limit(50).toList());
        return parsed;
    }

    InterviewProfileDto buildProfile(String text, Map<String, Object> parsed, InterviewSession session, String filename, LocalDateTime uploadedAt) {
        String normalizedText = text == null ? "" : text;
        String safeRole = session == null ? null : session.getRole();
        List<InterviewProfileDto.ClaimedSkill> claimed = extractSkills(normalizedText);
        int years = estimateYears(normalizedText);
        String roleFocus = detectRoleFocus(normalizedText);
        List<String> strengthHypotheses = new ArrayList<>();
        List<String> riskHypotheses = new ArrayList<>();
        List<String> probePriorities = new ArrayList<>();

        for (InterviewProfileDto.ClaimedSkill skill : claimed) {
            probePriorities.add(skill.getName().toLowerCase(Locale.ROOT).contains("lead") ? "collaboration_leadership" : "problem_solving_depth");
        }
        if (probePriorities.isEmpty()) {
            probePriorities.add("ownership_accountability");
            probePriorities.add("communication_clarity");
        }

        if (containsSeniorTitle(normalizedText) && normalizedText.length() < 400) {
            riskHypotheses.add("senior_title_shallow_description");
        }
        if (containsBuzzwordStack(normalizedText)) {
            riskHypotheses.add("buzzword_risk");
        }
        if (years >= 6 && !normalizedText.toLowerCase(Locale.ROOT).contains("result")) {
            riskHypotheses.add("long_tenure_no_outcomes");
            probePriorities.add(0, "ownership_accountability");
        }
        if (!StringUtils.hasText(safeRole)) {
            strengthHypotheses.add("adaptable_role");
        }

        List<String> candidateKeySkills = claimed.stream()
            .map(InterviewProfileDto.ClaimedSkill::getName)
            .limit(6)
            .toList();

        List<String> candidateExperienceDepth = new ArrayList<>();
        if (years > 0) {
            candidateExperienceDepth.add(years + " years of experience (auto-estimate)");
        }
        if (StringUtils.hasText(roleFocus)) {
            candidateExperienceDepth.add("Likely focus: " + roleFocus);
        }
        if (StringUtils.hasText(safeRole)) {
            candidateExperienceDepth.add("Target role: " + safeRole);
        }

        List<String> interviewerSummary = new ArrayList<>();
        if (StringUtils.hasText(roleFocus)) {
            interviewerSummary.add("CV suggests a " + roleFocus + " focus.");
        }
        if (years > 0) {
            interviewerSummary.add("Estimated experience: " + years + " years.");
        }
        if (!candidateKeySkills.isEmpty()) {
            interviewerSummary.add("Claims skills: " + String.join(", ", candidateKeySkills));
        }

        List<String> interviewerClaimsVsDemonstrated = new ArrayList<>();
        for (InterviewProfileDto.ClaimedSkill skill : claimed) {
            interviewerClaimsVsDemonstrated.add("Claims " + skill.getName() + " – probe for concrete examples.");
        }

        List<String> dedupedProbePriorities = dedupe(probePriorities);
        List<String> dedupedRiskHypotheses = dedupe(riskHypotheses);
        List<String> dedupedStrengths = dedupe(strengthHypotheses);
        LocalDateTime timestamp = uploadedAt == null ? LocalDateTime.now() : uploadedAt;

        return InterviewProfileDto.builder()
            .sessionUuid(session == null || session.getSessionUuid() == null ? null : session.getSessionUuid().toString())
            .cvFilename(filename)
            .uploadedAt(timestamp.toString())
            .candidateKeySkills(dedupe(candidateKeySkills))
            .candidateExperienceDepth(dedupe(candidateExperienceDepth))
            .candidateRealExamples(List.of())
            .interviewerSummary(dedupe(interviewerSummary))
            .interviewerProbePriorities(dedupedProbePriorities)
            .interviewerRiskHypotheses(dedupedRiskHypotheses)
            .interviewerClaimsVsDemonstrated(dedupe(interviewerClaimsVsDemonstrated))
            .claimedSkills(claimed)
            .experienceYearsEstimate(years == 0 ? null : years)
            .roleFocus(roleFocus)
            .strengthHypotheses(dedupedStrengths)
            .riskHypotheses(dedupedRiskHypotheses)
            .probePriorities(dedupedProbePriorities)
            .build();
    }

    private List<InterviewProfileDto.ClaimedSkill> extractSkills(String text) {
        if (!StringUtils.hasText(text)) return List.of();
        Set<String> skills = new LinkedHashSet<>();
        for (String token : text.split("[,\\n;/]")) {
            String trimmed = token.trim();
            if (trimmed.length() < 2) continue;
            if (trimmed.length() > 32) continue;
            if (trimmed.chars().allMatch(Character::isLetter)) {
                skills.add(trimmed);
            }
        }
        return skills.stream().limit(10)
            .map(s -> InterviewProfileDto.ClaimedSkill.builder()
                .name(s)
                .confidenceHint("medium")
                .build())
            .toList();
    }

    private int estimateYears(String text) {
        if (!StringUtils.hasText(text)) return 0;
        Matcher m = YEARS_PATTERN.matcher(text.toLowerCase(Locale.ROOT));
        int max = 0;
        while (m.find()) {
            try {
                max = Math.max(max, Integer.parseInt(m.group(1)));
            } catch (NumberFormatException ignored) {
            }
        }
        return max;
    }

    private String detectRoleFocus(String text) {
        if (!StringUtils.hasText(text)) return null;
        String lower = text.toLowerCase(Locale.ROOT);
        if (ROLE_FOCUS_FULLSTACK.stream().anyMatch(lower::contains)) return "fullstack";
        if (ROLE_FOCUS_BACKEND.stream().anyMatch(lower::contains)) return "backend";
        if (ROLE_FOCUS_FRONTEND.stream().anyMatch(lower::contains)) return "frontend";
        return null;
    }

    private boolean containsSeniorTitle(String text) {
        if (!StringUtils.hasText(text)) return false;
        String lower = text.toLowerCase(Locale.ROOT);
        return SENIOR_TITLES.stream().anyMatch(lower::contains);
    }

    private boolean containsBuzzwordStack(String text) {
        if (!StringUtils.hasText(text)) return false;
        String lower = text.toLowerCase(Locale.ROOT);
        int count = 0;
        for (String b : BUZZWORDS) {
            if (lower.contains(b)) count++;
        }
        return count >= 2;
    }

    private List<String> dedupe(List<String> list) {
        return new ArrayList<>(new LinkedHashSet<>(list));
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Map.of() : value);
        } catch (IOException e) {
            return "{}";
        }
    }

    private InterviewProfileDto readProfile(String json) {
        if (!StringUtils.hasText(json)) {
            return InterviewProfileDto.builder()
                .candidateKeySkills(List.of())
                .candidateExperienceDepth(List.of())
                .candidateRealExamples(List.of())
                .interviewerSummary(List.of())
                .interviewerProbePriorities(List.of())
                .interviewerRiskHypotheses(List.of())
                .interviewerClaimsVsDemonstrated(List.of())
                .claimedSkills(List.of())
                .strengthHypotheses(List.of())
                .riskHypotheses(List.of())
                .probePriorities(List.of())
                .build();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<InterviewProfileDto>() {});
        } catch (IOException e) {
            log.warn("Failed to parse interview_profile_json, returning empty profile", e);
            return InterviewProfileDto.builder()
                .candidateKeySkills(List.of())
                .candidateExperienceDepth(List.of())
                .candidateRealExamples(List.of())
                .interviewerSummary(List.of())
                .interviewerProbePriorities(List.of())
                .interviewerRiskHypotheses(List.of())
                .interviewerClaimsVsDemonstrated(List.of())
                .claimedSkills(List.of())
                .strengthHypotheses(List.of())
                .riskHypotheses(List.of())
                .probePriorities(List.of())
                .build();
        }
    }

    private int size(List<?> list) {
        return list == null ? 0 : list.size();
    }
}



