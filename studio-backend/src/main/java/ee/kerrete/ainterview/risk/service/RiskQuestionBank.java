package ee.kerrete.ainterview.risk.service;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RiskQuestionBank {

    private final List<String> standardQuestions = List.of(
            "Describe a recent team conflict you helped resolve. What did you do?",
            "Tell me about a time you disagreed with a technical decision. How did you handle it?",
            "Share a situation where miscommunication caused issues. How did you fix it?",
            "When have you taken ownership of a problem others ignored? What happened?",
            "Describe a time you operated with high ambiguity. How did you proceed?",
            "How do you manage stakeholders with competing priorities?",
            "Give an example of a tradeoff you made under time pressure. Why that choice?",
            "Tell me about a failure. What did you learn and change afterward?",
            "Describe when you gave tough feedback. How did you approach it?",
            "How do you ensure your work delivers measurable impact?"
    );

    public List<String> questionsForMode(String mode) {
        if (mode == null || mode.isBlank() || "STANDARD".equalsIgnoreCase(mode)) {
            return standardQuestions;
        }
        // For unknown modes, fall back to standard for now
        return standardQuestions;
    }

    public List<String> defaultQuestions() {
        return new ArrayList<>(standardQuestions);
    }
}

