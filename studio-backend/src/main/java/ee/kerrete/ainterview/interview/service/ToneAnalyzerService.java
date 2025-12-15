package ee.kerrete.ainterview.interview.service;

import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Set;

@Service
public class ToneAnalyzerService {

    public ToneResult analyze(String answer) {
        if (answer == null || answer.isBlank()) {
            return new ToneResult("NEUTRAL", "No answer content", 0);
        }
        String lower = answer.toLowerCase(Locale.ROOT);
        int positive = countMatches(lower, POSITIVE_MARKERS);
        int negative = countMatches(lower, NEGATIVE_MARKERS);
        String tone;
        String reason;
        int intensity;
        if (positive > negative) {
            tone = "POSITIVE";
            reason = "Positive markers detected";
            intensity = Math.min(100, positive * 15);
        } else if (negative > positive) {
            tone = "NEGATIVE";
            reason = "Negative markers detected";
            intensity = Math.min(100, negative * 20);
        } else {
            tone = "NEUTRAL";
            reason = "Balanced or no strong tone markers";
            intensity = 20;
        }
        return new ToneResult(tone, reason, intensity);
    }

    private int countMatches(String text, Set<String> markers) {
        int count = 0;
        for (String m : markers) {
            if (text.contains(m)) {
                count++;
            }
        }
        return count;
    }

    public record ToneResult(String tone, String reason, int intensity) {}

    private static final Set<String> POSITIVE_MARKERS = Set.of(
        "grateful", "thank", "excited", "proud", "pleased", "glad", "happy", "motivated", "learned", "improved"
    );

    private static final Set<String> NEGATIVE_MARKERS = Set.of(
        "frustrated", "angry", "upset", "hopeless", "stuck", "annoyed", "hate", "problematic", "fail", "failure"
    );
}


