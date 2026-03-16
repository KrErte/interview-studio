package ee.kerrete.ainterview.service;

import ee.kerrete.ainterview.model.Question;

import java.util.List;

public interface AiService {

    String complete(String prompt);

    String createChatCompletion(String systemPrompt, String userPrompt);

    String evaluateAnswer(String question, String answer);

    List<Question> generateQuestionsFromCv(String cvText, int technicalCount, int softCount);

    String generateSkillBoosterPlan(String jobMatcherSummary, List<String> focusSkills);
}
