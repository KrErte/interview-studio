package ee.kerrete.ainterview.taskexposure.dto;

import lombok.Data;

/**
 * Request payload for the 5-question questionnaire.
 * Maps to CLAUDE.md locked questions:
 * Q1. Role target
 * Q2. Last time worked in this role
 * Q3. Urgency
 * Q4. Recent work examples
 * Q5. Main blocker
 */
@Data
public class QuestionnaireRequest {
    private String cvText;
    private String roleTarget;
    private String lastWorkedInRole;
    private String urgency;
    private String recentWorkExamples;
    private String mainBlocker;
}
