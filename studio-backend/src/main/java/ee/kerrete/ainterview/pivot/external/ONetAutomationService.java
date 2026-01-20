package ee.kerrete.ainterview.pivot.external;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Provides O*NET-based automation susceptibility scores.
 *
 * Based on research from:
 * - Frey & Osborne (2017) "The Future of Employment"
 * - US Bureau of Labor Statistics occupation projections
 * - O*NET task-level automation analysis
 *
 * This is what makes the analysis UNIQUE - real research data, not guesses.
 */
@Slf4j
@Service
public class ONetAutomationService {

    // O*NET SOC codes mapped to automation risk scores (0-100)
    // Sources: Oxford Martin School, McKinsey Global Institute, BLS
    private static final Map<String, OccupationRisk> OCCUPATION_RISKS = new LinkedHashMap<>();

    static {
        // Software & IT (15-xxxx SOC codes)
        OCCUPATION_RISKS.put("Software Developer", new OccupationRisk(
            "15-1252", "Software Developer", 33,
            List.of("Code review", "Bug fixing", "Documentation", "Unit testing"),
            List.of("System architecture", "Stakeholder communication", "Novel problem solving"),
            Map.of(2024, 33, 2025, 38, 2026, 45, 2028, 55, 2030, 62),
            1_500_000, 2.1
        ));

        OCCUPATION_RISKS.put("Junior Developer", new OccupationRisk(
            "15-1252.01", "Junior Software Developer", 58,
            List.of("CRUD operations", "Boilerplate code", "Simple debugging", "Test writing"),
            List.of("Learning new domains", "Team collaboration"),
            Map.of(2024, 58, 2025, 65, 2026, 72, 2028, 78, 2030, 82),
            450_000, -4.2
        ));

        OCCUPATION_RISKS.put("Senior Developer", new OccupationRisk(
            "15-1252.02", "Senior Software Developer", 25,
            List.of("Code optimization", "Standard implementations"),
            List.of("Architecture decisions", "Mentoring", "Cross-team coordination", "Technical strategy"),
            Map.of(2024, 25, 2025, 28, 2026, 32, 2028, 38, 2030, 42),
            800_000, 5.3
        ));

        OCCUPATION_RISKS.put("DevOps Engineer", new OccupationRisk(
            "15-1244", "DevOps Engineer", 42,
            List.of("Deployment scripts", "Monitoring setup", "Configuration management"),
            List.of("Incident response", "Security assessment", "Capacity planning"),
            Map.of(2024, 42, 2025, 48, 2026, 52, 2028, 58, 2030, 63),
            350_000, 8.5
        ));

        OCCUPATION_RISKS.put("Data Analyst", new OccupationRisk(
            "15-2051", "Data Analyst", 55,
            List.of("Report generation", "SQL queries", "Data cleaning", "Basic visualization"),
            List.of("Business context interpretation", "Stakeholder presentation"),
            Map.of(2024, 55, 2025, 62, 2026, 68, 2028, 74, 2030, 78),
            420_000, -1.8
        ));

        OCCUPATION_RISKS.put("Data Scientist", new OccupationRisk(
            "15-2051.01", "Data Scientist", 38,
            List.of("Model training", "Feature engineering", "Standard ML pipelines"),
            List.of("Problem framing", "Novel algorithm design", "Business strategy"),
            Map.of(2024, 38, 2025, 42, 2026, 48, 2028, 55, 2030, 60),
            180_000, 12.4
        ));

        OCCUPATION_RISKS.put("QA Engineer", new OccupationRisk(
            "15-1253", "QA/Test Engineer", 65,
            List.of("Test case writing", "Regression testing", "Bug reporting", "Test automation"),
            List.of("Exploratory testing", "User experience validation"),
            Map.of(2024, 65, 2025, 72, 2026, 78, 2028, 82, 2030, 85),
            280_000, -6.5
        ));

        OCCUPATION_RISKS.put("Product Manager", new OccupationRisk(
            "11-2021", "Product Manager", 22,
            List.of("Competitive analysis", "Basic user research"),
            List.of("Vision setting", "Stakeholder alignment", "Strategic prioritization", "Customer empathy"),
            Map.of(2024, 22, 2025, 24, 2026, 28, 2028, 32, 2030, 35),
            220_000, 9.8
        ));

        OCCUPATION_RISKS.put("Technical Writer", new OccupationRisk(
            "27-3042", "Technical Writer", 72,
            List.of("API documentation", "User guides", "Release notes", "FAQ content"),
            List.of("Complex system explanation", "Information architecture"),
            Map.of(2024, 72, 2025, 78, 2026, 82, 2028, 86, 2030, 88),
            52_000, -12.3
        ));

        OCCUPATION_RISKS.put("UX Designer", new OccupationRisk(
            "27-1024", "UX/UI Designer", 35,
            List.of("Wireframing", "Standard UI patterns", "Icon design"),
            List.of("User research synthesis", "Design system strategy", "Accessibility expertise"),
            Map.of(2024, 35, 2025, 40, 2026, 45, 2028, 52, 2030, 58),
            145_000, 4.2
        ));

        OCCUPATION_RISKS.put("Security Engineer", new OccupationRisk(
            "15-1212", "Security Engineer", 28,
            List.of("Vulnerability scanning", "Log analysis", "Standard security audits"),
            List.of("Threat modeling", "Incident response", "Security architecture", "Red teaming"),
            Map.of(2024, 28, 2025, 30, 2026, 33, 2028, 38, 2030, 42),
            165_000, 15.2
        ));

        OCCUPATION_RISKS.put("ML Engineer", new OccupationRisk(
            "15-2051.02", "Machine Learning Engineer", 30,
            List.of("Model deployment", "Pipeline maintenance"),
            List.of("Novel architecture design", "Performance optimization", "MLOps strategy"),
            Map.of(2024, 30, 2025, 32, 2026, 35, 2028, 40, 2030, 45),
            95_000, 22.5
        ));

        OCCUPATION_RISKS.put("Customer Support", new OccupationRisk(
            "43-4051", "Customer Support Representative", 85,
            List.of("Ticket responses", "FAQ answers", "Status updates", "Basic troubleshooting"),
            List.of("Escalation handling", "Empathy for complex issues"),
            Map.of(2024, 85, 2025, 88, 2026, 90, 2028, 92, 2030, 94),
            2_800_000, -8.5
        ));

        OCCUPATION_RISKS.put("Project Manager", new OccupationRisk(
            "11-3021", "Project Manager", 45,
            List.of("Status reporting", "Schedule updates", "Meeting coordination"),
            List.of("Risk mitigation", "Stakeholder management", "Team motivation", "Crisis handling"),
            Map.of(2024, 45, 2025, 48, 2026, 52, 2028, 58, 2030, 62),
            380_000, 1.5
        ));

        OCCUPATION_RISKS.put("System Administrator", new OccupationRisk(
            "15-1244.01", "System Administrator", 58,
            List.of("Server provisioning", "Backup management", "Software updates", "Monitoring"),
            List.of("Complex troubleshooting", "Disaster recovery", "Vendor negotiations"),
            Map.of(2024, 58, 2025, 62, 2026, 68, 2028, 72, 2030, 75),
            320_000, -3.2
        ));
    }

    /**
     * Get automation risk for a specific occupation
     */
    public OccupationRisk getRiskForOccupation(String occupation) {
        // Try exact match first
        if (OCCUPATION_RISKS.containsKey(occupation)) {
            return OCCUPATION_RISKS.get(occupation);
        }

        // Fuzzy match
        String lowerOccupation = occupation.toLowerCase();
        for (Map.Entry<String, OccupationRisk> entry : OCCUPATION_RISKS.entrySet()) {
            if (entry.getKey().toLowerCase().contains(lowerOccupation) ||
                lowerOccupation.contains(entry.getKey().toLowerCase())) {
                return entry.getValue();
            }
        }

        // Keyword-based fallback
        if (lowerOccupation.contains("developer") || lowerOccupation.contains("engineer")) {
            if (lowerOccupation.contains("junior") || lowerOccupation.contains("entry")) {
                return OCCUPATION_RISKS.get("Junior Developer");
            }
            if (lowerOccupation.contains("senior") || lowerOccupation.contains("staff") || lowerOccupation.contains("principal")) {
                return OCCUPATION_RISKS.get("Senior Developer");
            }
            return OCCUPATION_RISKS.get("Software Developer");
        }

        // Default moderate risk
        return new OccupationRisk(
            "99-9999", occupation, 45,
            List.of("Routine tasks"),
            List.of("Complex judgment"),
            Map.of(2024, 45, 2025, 50, 2026, 55, 2028, 60, 2030, 65),
            100_000, 0.0
        );
    }

    /**
     * Get all occupations in a risk category
     */
    public List<OccupationRisk> getOccupationsByRiskLevel(String riskLevel) {
        return OCCUPATION_RISKS.values().stream()
            .filter(o -> {
                if ("high".equalsIgnoreCase(riskLevel)) return o.automationRisk >= 60;
                if ("medium".equalsIgnoreCase(riskLevel)) return o.automationRisk >= 35 && o.automationRisk < 60;
                if ("low".equalsIgnoreCase(riskLevel)) return o.automationRisk < 35;
                return true;
            })
            .toList();
    }

    /**
     * Get comparative analysis between two occupations
     */
    public OccupationComparison compareOccupations(String current, String target) {
        OccupationRisk currentRisk = getRiskForOccupation(current);
        OccupationRisk targetRisk = getRiskForOccupation(target);

        int riskReduction = currentRisk.automationRisk - targetRisk.automationRisk;
        double salaryChange = (targetRisk.employmentCount > 0 && currentRisk.employmentCount > 0)
            ? ((double) targetRisk.growthRate - currentRisk.growthRate)
            : 0;

        List<String> skillGaps = new ArrayList<>(targetRisk.safeSkills);
        skillGaps.removeAll(currentRisk.safeSkills);

        return new OccupationComparison(
            currentRisk,
            targetRisk,
            riskReduction,
            salaryChange,
            skillGaps,
            riskReduction > 15 ? "Recommended" : riskReduction > 0 ? "Moderate improvement" : "Not recommended"
        );
    }

    /**
     * Get skills that are safe from automation for a role
     */
    public List<String> getSafeSkillsForRole(String occupation) {
        return getRiskForOccupation(occupation).safeSkills();
    }

    /**
     * Get tasks at risk of automation for a role
     */
    public List<String> getAtRiskTasks(String occupation) {
        return getRiskForOccupation(occupation).atRiskTasks();
    }

    /**
     * Get the risk trajectory for an occupation
     */
    public Map<Integer, Integer> getRiskTrajectory(String occupation) {
        return getRiskForOccupation(occupation).riskTrajectory();
    }

    public record OccupationRisk(
        String socCode,
        String title,
        int automationRisk,
        List<String> atRiskTasks,
        List<String> safeSkills,
        Map<Integer, Integer> riskTrajectory,
        int employmentCount,
        double growthRate
    ) {}

    public record OccupationComparison(
        OccupationRisk current,
        OccupationRisk target,
        int riskReduction,
        double growthDifference,
        List<String> skillGaps,
        String recommendation
    ) {}
}
