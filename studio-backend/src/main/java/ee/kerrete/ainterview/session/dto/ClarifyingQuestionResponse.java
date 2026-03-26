package ee.kerrete.ainterview.session.dto;

public record ClarifyingQuestionResponse(
    String question,
    int questionNumber,
    int totalQuestions,
    boolean done
) {}
