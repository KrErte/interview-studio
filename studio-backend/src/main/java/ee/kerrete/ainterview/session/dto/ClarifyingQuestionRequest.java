package ee.kerrete.ainterview.session.dto;

import java.util.List;

public record ClarifyingQuestionRequest(
    String targetRole,
    String experienceLevel,
    String mainChallenge,
    List<QAPair> previousQAs
) {
    public record QAPair(String question, String answer) {}
}
