package ee.kerrete.ainterview.interview.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.StringJoiner;

@Service
public class NarrativeService {

    public NarrativeResult buildNarrative(String band,
                                          List<String> strengths,
                                          List<String> growthAreas,
                                          List<String> signals,
                                          String tone) {
        String safeBand = band == null ? "FOUNDATIONAL" : band;
        String bandSentence = switch (safeBand) {
            case "STRONG" -> "Current evidence points to strong, consistent performance with clear outcomes.";
            case "SOLID" -> "Responses suggest solid capability with room to deepen specificity.";
            case "EMERGING" -> "Signals show emerging capability; adding concrete outcomes would strengthen the story.";
            default -> "Early indicators are foundational; more detail on decisions and results will help validate strengths.";
        };

        String strengthsSentence = strengths != null && !strengths.isEmpty()
            ? "Observed strengths include " + String.join(", ", strengths) + "."
            : "Key strengths are still forming; continue to elicit concrete examples.";

        String growthSentence = growthAreas != null && !growthAreas.isEmpty()
            ? "Growth areas to watch: " + String.join(", ", growthAreas) + "."
            : "No major growth areas identified yet; keep probing for specifics.";

        String signalsSentence = signals != null && !signals.isEmpty()
            ? "Signals observed so far: " + String.join(", ", signals) + "."
            : "Signals remain limited; gather more evidence to calibrate.";

        String closing = switch (tone == null ? "NEUTRAL" : tone) {
            case "POSITIVE" -> "One approach could be to keep highlighting outcomes while maintaining this constructive tone.";
            case "NEGATIVE" -> "One approach might be to ground answers in concrete actions and outcomes to balance the tone.";
            default -> "Consider adding recent, specific examples to validate these observations.";
        };

        StringJoiner joiner = new StringJoiner(" ");
        joiner.add(bandSentence);
        joiner.add(strengthsSentence);
        joiner.add(growthSentence);
        joiner.add(signalsSentence);
        joiner.add(closing);
        String narrative = joiner.toString();

        // Ensure 3-6 sentences by truncating extras if any (unlikely with fixed structure)
        String[] sentences = narrative.split("\\. ");
        if (sentences.length > 6) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 6; i++) {
                sb.append(sentences[i].trim());
                if (!sentences[i].trim().endsWith(".")) sb.append(".");
                sb.append(" ");
            }
            narrative = sb.toString().trim();
        }

        return new NarrativeResult(narrative, safeBand);
    }

    public record NarrativeResult(String narrative, String band) {}
}


