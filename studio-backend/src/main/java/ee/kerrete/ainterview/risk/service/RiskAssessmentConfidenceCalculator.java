package ee.kerrete.ainterview.risk.service;

import lombok.Builder;
import lombok.Value;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Deterministic, low-variance confidence calculator for risk assessments.
 * Balances coverage (completeness), signal strength, and consistency.
 */
public class RiskAssessmentConfidenceCalculator {

    private static final double BASE = 0.20; // 20% baseline from CV/profile
    private static final double COMPLETENESS_WEIGHT = 0.55;
    private static final double SIGNAL_WEIGHT = 0.15;
    private static final double CONSISTENCY_WEIGHT = 0.10;
    private static final double MIN_CONF = 0.05;
    private static final double MAX_CONF = 0.95;

    private static final List<String> CATEGORIES = List.of(
            "role", "stack", "years", "industry", "impact", "leadership", "system_design", "learning"
    );

    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\b\\d+(?:\\.\\d+)?\\b");
    private static final Pattern PERCENT_PATTERN = Pattern.compile("%");
    private static final Pattern TIME_PATTERN = Pattern.compile("\\b(ms|s|sec|secs|seconds?|minutes?|hours?|days?|weeks?|months?|years?)\\b");
    private static final Pattern MONEY_PATTERN = Pattern.compile("[$€£]|\\bUSD\\b|\\bEUR\\b");

    private static final List<String> TOOL_TERMS = List.of(
            "kubernetes", "docker", "aws", "gcp", "azure", "postgres", "mysql", "mongodb",
            "react", "angular", "vue", "spring", "java", "python", "node", "architecture",
            "event-driven", "microservice", "distributed", "cache", "redis", "queue"
    );

    public Result compute(List<Answer> answers, List<String> questions) {
        Coverage coverage = computeCoverage(answers, questions);
        double completenessScore = coverage.coverage;
        double signalStrength = computeSignalStrength(answers);
        double consistency = computeConsistency(answers);

        double conf = BASE
                + COMPLETENESS_WEIGHT * completenessScore
                + SIGNAL_WEIGHT * signalStrength
                + CONSISTENCY_WEIGHT * consistency;

        conf = clamp(conf, MIN_CONF, MAX_CONF);
        return Result.builder()
                .confidence(conf)
                .completeness(completenessScore)
                .signalStrength(signalStrength)
                .consistency(consistency)
                .coveredCategories(coverage.coveredCategories)
                .missingCategories(coverage.missingCategories)
                .build();
    }

    private Coverage computeCoverage(List<Answer> answers, List<String> questions) {
        Set<String> covered = new HashSet<>();
        for (Answer a : answers) {
            String qText = questionTextFor(a, questions);
            String text = (qText + " " + safe(a.getAnswer())).toLowerCase(Locale.ROOT);
            if (containsAny(text, List.of("role", "title", "position"))) covered.add("role");
            if (containsAny(text, List.of("stack", "tech", "technology", "framework", "language", "python", "java", "node", "react"))) covered.add("stack");
            if (containsAny(text, List.of("year", "experience", "exp", "yoe", "years"))) covered.add("years");
            if (containsAny(text, List.of("industry", "sector", "domain", "fintech", "health", "education"))) covered.add("industry");
            if (containsAny(text, List.of("%", "impact", "result", "improved", "reduced", "increase", "decrease", "growth"))) covered.add("impact");
            if (containsAny(text, List.of("lead", "manage", "mentor", "coach", "team", "stakeholder"))) covered.add("leadership");
            if (containsAny(text, List.of("design", "architecture", "scalable", "distributed", "system"))) covered.add("system_design");
            if (containsAny(text, List.of("learn", "course", "cert", "upskill", "training"))) covered.add("learning");
        }
        double coverage = CATEGORIES.isEmpty() ? 0.0 : (double) covered.size() / CATEGORIES.size();
        Set<String> missing = new HashSet<>(CATEGORIES);
        missing.removeAll(covered);
        return new Coverage(coverage, covered, missing);
    }

    private double computeSignalStrength(List<Answer> answers) {
        if (answers == null || answers.isEmpty()) {
            return 0.0;
        }
        double total = 0.0;
        for (Answer a : answers) {
            String text = safe(a.getAnswer()).toLowerCase(Locale.ROOT);
            int hits = 0;
            if (NUMBER_PATTERN.matcher(text).find()) hits++;
            if (PERCENT_PATTERN.matcher(text).find()) hits++;
            if (TIME_PATTERN.matcher(text).find()) hits++;
            if (MONEY_PATTERN.matcher(text).find()) hits++;
            for (String tool : TOOL_TERMS) {
                if (text.contains(tool)) {
                    hits++;
                    break;
                }
            }
            double lenFactor = Math.min(0.2, text.length() / 500.0); // mild boost for detail
            double score = Math.min(1.0, (hits * 0.2) + lenFactor);
            total += score;
        }
        return total / answers.size();
    }

    private double computeConsistency(List<Answer> answers) {
        if (answers == null || answers.isEmpty()) {
            return 0.9; // neutral
        }
        double score = 0.95;
        for (Answer a : answers) {
            String text = safe(a.getAnswer()).toLowerCase(Locale.ROOT);
            boolean senior = text.contains("senior") || text.contains("lead") || text.contains("principal");
            boolean junior = text.contains("junior");
            boolean manyYears = text.matches(".*\\b(8|9|10|1\\d|2\\d)\\s*(years|yrs|yoe)\\b.*");
            boolean tinyYears = text.matches(".*\\b(0|1|2)\\s*(years|yrs|yoe)\\b.*");
            if (senior && tinyYears) {
                score -= 0.2;
            }
            if (junior && manyYears) {
                score -= 0.15;
            }
            if (score < 0.6) {
                score = 0.6; // floor to avoid wild drops
                break;
            }
        }
        return clamp(score, 0.6, 1.0);
    }

    private String questionTextFor(Answer answer, List<String> questions) {
        if (questions == null || questions.isEmpty() || answer == null || !StringUtils.hasText(answer.getQuestionId())) {
            return "";
        }
        String[] parts = answer.getQuestionId().split(":");
        if (parts.length < 2) {
            return "";
        }
        try {
            int idx = Integer.parseInt(parts[1]);
            if (idx >= 0 && idx < questions.size()) {
                return questions.get(idx);
            }
        } catch (NumberFormatException ignored) {
        }
        return "";
    }

    private boolean containsAny(String text, List<String> keywords) {
        for (String k : keywords) {
            if (text.contains(k)) return true;
        }
        return false;
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    @Value
    @Builder
    public static class Answer {
        String questionId;
        String questionText;
        String answer;
    }

    private record Coverage(double coverage, Set<String> coveredCategories, Set<String> missingCategories) { }

    @Value
    @Builder
    public static class Result {
        double confidence; // 0..1
        double completeness;
        double signalStrength;
        double consistency;
        Set<String> coveredCategories;
        Set<String> missingCategories;
    }
}

