package ee.kerrete.ainterview.interview.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class AffectAnalyzerService {

    public AffectResult analyze(String answer, ToneAnalyzerService.ToneResult toneResult) {
        if (answer == null || answer.isBlank()) {
            return new AffectResult("LOW", "No answer content");
        }
        String lower = answer.toLowerCase(Locale.ROOT);
        int clarity = countMarkers(lower, ACTION_MARKERS) + countMarkers(lower, OUTCOME_MARKERS) + countMarkers(lower, STAKEHOLDER_MARKERS);
        int lengthWords = lower.split("\\s+").length;
        double uniqueness = uniquenessRatio(lower);
        int intensity = toneResult == null ? 0 : toneResult.intensity();

        int score = clarity * 10;
        if (lengthWords > 25) score += 10;
        if (uniqueness > 0.6) score += 10;
        score += (int) (intensity * 0.2);

        String affect;
        String reason;
        if (score >= 40) {
            affect = "HIGH";
            reason = "Clear actions/outcomes and coherent tone";
        } else if (score >= 25) {
            affect = "MEDIUM";
            reason = "Some clarity markers and moderate tone";
        } else {
            affect = "LOW";
            reason = "Limited clarity or repetitive/short answer";
        }
        return new AffectResult(affect, reason);
    }

    private int countMarkers(String text, Set<String> markers) {
        int c = 0;
        for (String m : markers) {
            if (text.contains(m)) c++;
        }
        return c;
    }

    private double uniquenessRatio(String lower) {
        String[] tokens = lower.replaceAll("[^a-z0-9 ]", " ").split("\\s+");
        if (tokens.length == 0) return 1.0;
        Set<String> uniq = new HashSet<>(Arrays.asList(tokens));
        return (double) uniq.size() / (double) tokens.length;
    }

    public record AffectResult(String affect, String reason) {}

    private static final Set<String> ACTION_MARKERS = Set.of("built", "led", "implemented", "designed", "created", "drove", "owned");
    private static final Set<String> OUTCOME_MARKERS = Set.of("result", "impact", "improved", "increased", "reduced", "metric", "kpi");
    private static final Set<String> STAKEHOLDER_MARKERS = Set.of("team", "stakeholder", "partner", "customer", "manager", "leadership");
}


