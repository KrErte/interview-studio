package ee.kerrete.ainterview.interview.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.interview.dto.CandidateSummaryDto;
import ee.kerrete.ainterview.model.InterviewSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CandidateSummaryService {

    private static final Pattern METRIC_PATTERN = Pattern.compile("(\\d+\\s*(%|percent|percentage|k|m|million|billion))|(\\d+\\s*(weeks?|months?|years?|days?))", Pattern.CASE_INSENSITIVE);
    private static final Pattern OWNERSHIP_PATTERN = Pattern.compile("\\b(own|owned|ownership|responsible|accountable)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern STAKEHOLDER_PATTERN = Pattern.compile("\\b(stakeholder|partner|collaborat|team)\\b", Pattern.CASE_INSENSITIVE);

    private final ObjectMapper objectMapper;
    private final ToneAnalyzerService toneAnalyzerService;
    private final AffectAnalyzerService affectAnalyzerService;
    private final NarrativeService narrativeService;

    @Value("${interview.stylePenaltyEnabled:false}")
    private boolean stylePenaltyEnabled;

    public CandidateSummaryDto loadFromSession(InterviewSession session) {
        String json = session.getCandidateSummaryJson();
        if (json == null || json.isBlank()) {
            return emptySummary();
        }
        try {
            CandidateSummaryDto dto = objectMapper.readValue(json, new TypeReference<>() {});
            return normalize(dto);
        } catch (Exception e) {
            return emptySummary();
        }
    }

    public CandidateSummaryDto recordTurn(InterviewSession session,
                                          String questionId,
                                          String question,
                                          String answer,
                                          String decision,
                                          Integer fitScore,
                                          String fitTrend,
                                          String currentDimension,
                                          int answeredCount,
                                          double last3Average) {
        CandidateSummaryDto current = loadFromSession(session);

        int newAnswered = answeredCount;
        if (answer != null && !answer.isBlank()) {
            newAnswered = Math.max(current.getAnsweredCount(), answeredCount);
        }

        List<String> strengths = new ArrayList<>(safeList(current.getStrengths()));
        List<String> growth = new ArrayList<>(safeList(current.getGrowthAreas()));
        List<CandidateSummaryDto.SignalDto> signals = new ArrayList<>(safeList(current.getSignals()));
        List<CandidateSummaryDto.EvidenceDto> evidence = new ArrayList<>(safeList(current.getEvidenceLast3()));

        analyzeAnswer(answer, strengths, growth, signals);
        evidence = updateEvidence(evidence, question, answer);

        strengths = dedupeAndTrim(strengths, 5);
        growth = dedupeAndTrim(growth, 5);
        signals = dedupeSignals(signals, 8);
        evidence = trimEvidence(evidence, 3);

        ToneAnalyzerService.ToneResult toneResult = toneAnalyzerService.analyze(answer);
        AffectAnalyzerService.AffectResult affectResult = affectAnalyzerService.analyze(answer, toneResult);
        String band = deriveBand(last3Average);
        NarrativeService.NarrativeResult narrativeResult = narrativeService.buildNarrative(band, strengths, growth, signals.stream().map(CandidateSummaryDto.SignalDto::getLabel).toList(), toneResult.tone());
        Integer deliveryScore = computeDeliveryScore(stylePenaltyEnabled, toneResult, affectResult);
        String updatedAt = LocalDateTime.now().toString();

        CandidateSummaryDto next = CandidateSummaryDto.builder()
            .updatedAt(updatedAt)
            .answeredCount(newAnswered)
            .narrative(narrativeResult.narrative())
            .band(narrativeResult.band())
            .strengths(strengths)
            .growthAreas(growth)
            .signals(signals)
            .evidenceLast3(evidence)
            .tone(toneResult.tone())
            .affect(affectResult.affect())
            .affectReason(affectResult.reason())
            .lastFitScore(fitScore)
            .lastFitTrend(fitTrend)
            .deliveryScore(deliveryScore)
            .build();

        try {
            session.setCandidateSummaryJson(objectMapper.writeValueAsString(next));
            session.setCandidateSummaryUpdatedAt(LocalDateTime.now());
        } catch (Exception e) {
            // swallow but keep session usable
        }
        return next;
    }

    private void analyzeAnswer(String answer,
                               List<String> strengths,
                               List<String> growthAreas,
                               List<CandidateSummaryDto.SignalDto> signals) {
        if (answer == null || answer.isBlank()) {
            return;
        }
        String lower = answer.toLowerCase(Locale.ROOT);
        int words = answer.trim().split("\\s+").length;

        if (METRIC_PATTERN.matcher(answer).find()) {
            strengths.add("Measures impact with metrics");
            signals.add(CandidateSummaryDto.SignalDto.builder().label("Evidence of metrics").confidence("HIGH").build());
        }
        if (OWNERSHIP_PATTERN.matcher(lower).find()) {
            strengths.add("Ownership & accountability");
        }
        if (STAKEHOLDER_PATTERN.matcher(lower).find()) {
            signals.add(CandidateSummaryDto.SignalDto.builder().label("Stakeholder management").confidence("MEDIUM").build());
        }
        if (words < 20) {
            growthAreas.add("Needs more depth");
            signals.add(CandidateSummaryDto.SignalDto.builder().label("Response brevity").confidence("MEDIUM").build());
        }
        double uniqueness = uniquenessRatio(lower);
        if (uniqueness < 0.55) {
            growthAreas.add("Low specificity");
        }
    }

    private double uniquenessRatio(String lower) {
        if (lower == null || lower.isBlank()) return 1.0;
        String[] tokens = lower.replaceAll("[^a-z0-9 ]", " ").split("\\s+");
        if (tokens.length == 0) return 1.0;
        Set<String> uniq = new LinkedHashSet<>();
        for (String t : tokens) {
            if (!t.isBlank()) {
                uniq.add(t);
            }
        }
        return (double) uniq.size() / (double) tokens.length;
    }

    private List<CandidateSummaryDto.EvidenceDto> updateEvidence(List<CandidateSummaryDto.EvidenceDto> evidence,
                                                                 String question,
                                                                 String answer) {
        if (answer == null || answer.isBlank()) {
            return evidence;
        }
        String answerShort = answer.length() <= 180 ? answer : answer.substring(0, 177) + "...";
        evidence.add(CandidateSummaryDto.EvidenceDto.builder()
            .question(question)
            .answerShort(answerShort)
            .build());
        return evidence;
    }

    private List<String> dedupeAndTrim(List<String> items, int cap) {
        LinkedHashSet<String> set = new LinkedHashSet<>(items);
        List<String> out = new ArrayList<>(set);
        if (out.size() > cap) {
            return out.subList(out.size() - cap, out.size());
        }
        return out;
    }

    private List<CandidateSummaryDto.SignalDto> dedupeSignals(List<CandidateSummaryDto.SignalDto> signals, int cap) {
        LinkedHashSet<String> seen = new LinkedHashSet<>();
        List<CandidateSummaryDto.SignalDto> out = new ArrayList<>();
        for (CandidateSummaryDto.SignalDto s : signals) {
            if (s == null || s.getLabel() == null) continue;
            if (seen.add(s.getLabel())) {
                out.add(s);
            }
        }
        if (out.size() > cap) {
            return out.subList(out.size() - cap, out.size());
        }
        return out;
    }

    private List<CandidateSummaryDto.EvidenceDto> trimEvidence(List<CandidateSummaryDto.EvidenceDto> list, int cap) {
        if (list.size() <= cap) return list;
        return list.subList(list.size() - cap, list.size());
    }

    private CandidateSummaryDto emptySummary() {
        return CandidateSummaryDto.builder()
            .updatedAt(null)
            .answeredCount(0)
            .narrative("No answers recorded yet. Awaiting initial response.")
            .band("FOUNDATIONAL")
            .strengths(List.of())
            .growthAreas(List.of())
            .signals(List.of())
            .evidenceLast3(List.of())
            .tone(null)
            .affect(null)
            .affectReason(null)
            .lastFitScore(null)
            .lastFitTrend(null)
            .deliveryScore(null)
            .build();
    }

    private <T> List<T> safeList(List<T> source) {
        return source == null ? new ArrayList<>() : new ArrayList<>(source);
    }

    private CandidateSummaryDto normalize(CandidateSummaryDto dto) {
        return CandidateSummaryDto.builder()
            .updatedAt(dto.getUpdatedAt())
            .answeredCount(dto.getAnsweredCount())
            .narrative(dto.getNarrative() == null ? "" : dto.getNarrative())
            .strengths(dto.getStrengths() == null ? List.of() : dto.getStrengths())
            .growthAreas(dto.getGrowthAreas() == null ? List.of() : dto.getGrowthAreas())
            .signals(dto.getSignals() == null ? List.of() : dto.getSignals())
            .evidenceLast3(dto.getEvidenceLast3() == null ? List.of() : dto.getEvidenceLast3())
            .tone(dto.getTone())
            .affect(dto.getAffect())
            .affectReason(dto.getAffectReason())
            .lastFitScore(dto.getLastFitScore())
            .lastFitTrend(dto.getLastFitTrend())
            .band(dto.getBand() == null ? "FOUNDATIONAL" : dto.getBand())
            .deliveryScore(dto.getDeliveryScore())
            .build();
    }

    private String deriveBand(double last3Average) {
        double score5Scale = last3Average <= 0 ? 2.0 : Math.min(5.0, last3Average);
        if (score5Scale >= 4.2) return "STRONG";
        if (score5Scale >= 3.2) return "SOLID";
        if (score5Scale >= 2.2) return "EMERGING";
        return "FOUNDATIONAL";
    }

    private Integer computeDeliveryScore(boolean enabled,
                                         ToneAnalyzerService.ToneResult tone,
                                         AffectAnalyzerService.AffectResult affect) {
        if (!enabled) {
            return null;
        }
        int penalty = 0;
        if (tone != null && "NEGATIVE".equals(tone.tone())) {
            penalty += Math.min(40, tone.intensity() / 2);
        } else if (tone != null) {
            penalty += tone.intensity() / 5;
        }
        if (affect != null) {
            if ("LOW".equals(affect.affect())) penalty += 30;
            if ("MEDIUM".equals(affect.affect())) penalty += 10;
        }
        int delivery = Math.max(0, 100 - penalty);
        return delivery;
    }
}


