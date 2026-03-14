package ee.kerrete.ainterview.session.dto;

public record CreateSessionRequest(
    String mode,           // SIMPLE or ADVANCED
    String targetRole,
    String experienceLevel,    // Simple Q2
    String mainChallenge,      // Simple Q3
    String lastWorkedInRole,   // Advanced Q2
    String urgency,            // Advanced Q3
    String recentWorkExamples, // Advanced Q4
    String mainBlocker,        // Advanced Q5
    String cvText              // Advanced CV upload
) {}
