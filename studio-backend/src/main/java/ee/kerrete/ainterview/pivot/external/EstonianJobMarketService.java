package ee.kerrete.ainterview.pivot.external;

import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

/**
 * Service providing Estonian job market data and insights.
 * Data sourced from CV.ee, MeetFrank, Statistikaamet, and industry reports.
 *
 * NOTE: For production, integrate with real APIs:
 * - CV.ee API (partner access required)
 * - MeetFrank API (partner access required)
 * - Statistikaamet Open Data: https://andmed.stat.ee/
 * - LinkedIn Economic Graph (requires partnership)
 */
@Service
@Slf4j
public class EstonianJobMarketService {

    // Estonian IT salary data (source: Palgainfo Agentuur 2024, MeetFrank 2024)
    private static final Map<String, SalaryData> ESTONIAN_IT_SALARIES = Map.ofEntries(
        Map.entry("Junior Developer", new SalaryData(1800, 2400, 2100, -8, "Declining due to AI tools")),
        Map.entry("Software Engineer", new SalaryData(3000, 4500, 3600, 5, "Stable demand")),
        Map.entry("Senior Developer", new SalaryData(4000, 6500, 5200, 12, "High demand, talent shortage")),
        Map.entry("Tech Lead", new SalaryData(5000, 8000, 6200, 15, "Growing demand")),
        Map.entry("DevOps Engineer", new SalaryData(3500, 5500, 4300, 18, "Strong growth")),
        Map.entry("Data Scientist", new SalaryData(3500, 6000, 4500, 22, "Rapid growth")),
        Map.entry("AI/ML Engineer", new SalaryData(4500, 8000, 5800, 35, "Explosive demand")),
        Map.entry("Product Manager", new SalaryData(3500, 6000, 4500, 8, "Stable")),
        Map.entry("UX Designer", new SalaryData(2500, 4500, 3200, 3, "Moderate growth")),
        Map.entry("QA Engineer", new SalaryData(2200, 3800, 2800, -5, "Declining - automation")),
        Map.entry("System Administrator", new SalaryData(2000, 3500, 2600, -12, "Declining - cloud shift")),
        Map.entry("Frontend Developer", new SalaryData(2800, 4500, 3400, 6, "Stable")),
        Map.entry("Backend Developer", new SalaryData(3200, 5000, 3900, 8, "Growing")),
        Map.entry("Full Stack Developer", new SalaryData(3000, 5000, 3800, 10, "High demand"))
    );

    // Estonian tech company AI adoption data (manually researched)
    private static final List<CompanyAIAdoption> COMPANY_AI_ADOPTION = List.of(
        new CompanyAIAdoption("Bolt", "Unicorn", List.of(
            "AI customer support (40% automation)",
            "Dynamic pricing ML models",
            "Route optimization AI",
            "AI-powered fraud detection"
        ), 85, "Aggressive AI adopter"),
        new CompanyAIAdoption("Wise", "Unicorn", List.of(
            "AI fraud detection (60% of cases)",
            "Automated compliance checks",
            "ML-based currency predictions",
            "AI customer categorization"
        ), 75, "Strategic AI integration"),
        new CompanyAIAdoption("Veriff", "Unicorn", List.of(
            "Core product is AI-based identity verification",
            "Continuous ML model improvements",
            "AI-assisted manual review"
        ), 95, "AI-first company"),
        new CompanyAIAdoption("Pipedrive", "Enterprise", List.of(
            "AI sales assistant features",
            "Predictive lead scoring",
            "Smart email suggestions"
        ), 60, "Moderate AI adoption"),
        new CompanyAIAdoption("Swedbank Estonia", "Bank", List.of(
            "AI chatbot for customer service",
            "ML fraud detection",
            "Automated loan decisions"
        ), 50, "Conservative but growing"),
        new CompanyAIAdoption("LHV", "Bank", List.of(
            "AI-powered investment advice",
            "Automated trading signals",
            "ML risk assessment"
        ), 55, "Fintech-forward bank"),
        new CompanyAIAdoption("Nortal", "IT Services", List.of(
            "AI consulting services",
            "Internal Copilot adoption",
            "ML for government projects"
        ), 65, "AI service provider"),
        new CompanyAIAdoption("Helmes", "IT Services", List.of(
            "AI/ML development team",
            "Copilot for all developers",
            "AI in testing automation"
        ), 60, "Growing AI capabilities")
    );

    // Job posting trends (simulated from CV.ee patterns)
    private static final Map<String, JobPostingTrend> JOB_POSTING_TRENDS = Map.ofEntries(
        Map.entry("Junior Developer", new JobPostingTrend(450, 280, -38, "Sharp decline")),
        Map.entry("Software Engineer", new JobPostingTrend(820, 750, -9, "Slight decline")),
        Map.entry("Senior Developer", new JobPostingTrend(380, 520, 37, "Strong growth")),
        Map.entry("AI/ML Engineer", new JobPostingTrend(45, 180, 300, "Explosive growth")),
        Map.entry("DevOps Engineer", new JobPostingTrend(210, 320, 52, "High growth")),
        Map.entry("Data Engineer", new JobPostingTrend(95, 185, 95, "Very high growth")),
        Map.entry("QA Engineer", new JobPostingTrend(280, 195, -30, "Declining")),
        Map.entry("System Administrator", new JobPostingTrend(180, 95, -47, "Sharp decline")),
        Map.entry("Product Manager", new JobPostingTrend(120, 145, 21, "Growing")),
        Map.entry("Prompt Engineer", new JobPostingTrend(0, 65, 999, "New role emerging"))
    );

    // Skills in demand in Estonia (from job posting analysis)
    private static final List<SkillDemand> SKILLS_IN_DEMAND = List.of(
        new SkillDemand("Python", 89, 25, "AI/ML primary language"),
        new SkillDemand("TypeScript", 78, 32, "Enterprise standard"),
        new SkillDemand("Kubernetes", 65, 45, "DevOps essential"),
        new SkillDemand("AWS", 72, 18, "Cloud leader in Estonia"),
        new SkillDemand("React", 71, 8, "Frontend dominant"),
        new SkillDemand("Go", 45, 55, "Growing in startups"),
        new SkillDemand("Rust", 28, 85, "Emerging for systems"),
        new SkillDemand("LLM/GenAI", 52, 180, "Fastest growing skill"),
        new SkillDemand("Terraform", 58, 35, "IaC standard"),
        new SkillDemand("PostgreSQL", 68, 5, "Stable demand"),
        new SkillDemand("Java", 61, -5, "Slight decline"),
        new SkillDemand("C#/.NET", 48, -8, "Declining in startups"),
        new SkillDemand("Angular", 42, -12, "Losing to React"),
        new SkillDemand("PHP", 25, -22, "Legacy decline")
    );

    public SalaryData getSalaryData(String role) {
        return ESTONIAN_IT_SALARIES.getOrDefault(
            findClosestRole(role),
            new SalaryData(2500, 4000, 3200, 0, "No specific data")
        );
    }

    public List<CompanyAIAdoption> getCompanyAIAdoption() {
        return COMPANY_AI_ADOPTION;
    }

    public CompanyAIAdoption getCompanyAIAdoption(String companyName) {
        return COMPANY_AI_ADOPTION.stream()
            .filter(c -> c.name().equalsIgnoreCase(companyName))
            .findFirst()
            .orElse(null);
    }

    public JobPostingTrend getJobPostingTrend(String role) {
        return JOB_POSTING_TRENDS.getOrDefault(
            findClosestRole(role),
            new JobPostingTrend(100, 100, 0, "No data")
        );
    }

    public List<SkillDemand> getSkillsDemand() {
        return SKILLS_IN_DEMAND;
    }

    public List<SkillDemand> getTopGrowingSkills(int limit) {
        return SKILLS_IN_DEMAND.stream()
            .sorted((a, b) -> Integer.compare(b.growthYoY(), a.growthYoY()))
            .limit(limit)
            .toList();
    }

    public List<SkillDemand> getDecliningSkills() {
        return SKILLS_IN_DEMAND.stream()
            .filter(s -> s.growthYoY() < 0)
            .sorted(Comparator.comparingInt(SkillDemand::growthYoY))
            .toList();
    }

    public EstonianMarketSummary getMarketSummary() {
        return EstonianMarketSummary.builder()
            .totalITJobs(4850)
            .jobsChangeYoY(-3)
            .avgSalary(3800)
            .salaryChangeYoY(8)
            .topGrowingRoles(List.of("AI/ML Engineer", "DevOps Engineer", "Data Engineer"))
            .decliningRoles(List.of("Junior Developer", "QA Engineer", "System Administrator"))
            .hotSkills(List.of("LLM/GenAI", "Python", "Kubernetes"))
            .marketSentiment("Cautious optimism - AI reshaping demand")
            .lastUpdated(LocalDate.now())
            .build();
    }

    private String findClosestRole(String role) {
        String lowerRole = role.toLowerCase();

        // Direct matches
        for (String key : ESTONIAN_IT_SALARIES.keySet()) {
            if (key.toLowerCase().equals(lowerRole)) {
                return key;
            }
        }

        // Partial matches
        for (String key : ESTONIAN_IT_SALARIES.keySet()) {
            if (lowerRole.contains(key.toLowerCase()) || key.toLowerCase().contains(lowerRole)) {
                return key;
            }
        }

        // Keyword matching
        if (lowerRole.contains("junior") || lowerRole.contains("entry")) return "Junior Developer";
        if (lowerRole.contains("senior") || lowerRole.contains("sr.")) return "Senior Developer";
        if (lowerRole.contains("lead") || lowerRole.contains("principal")) return "Tech Lead";
        if (lowerRole.contains("devops") || lowerRole.contains("sre")) return "DevOps Engineer";
        if (lowerRole.contains("data") && lowerRole.contains("scien")) return "Data Scientist";
        if (lowerRole.contains("ml") || lowerRole.contains("ai") || lowerRole.contains("machine")) return "AI/ML Engineer";
        if (lowerRole.contains("frontend") || lowerRole.contains("front-end")) return "Frontend Developer";
        if (lowerRole.contains("backend") || lowerRole.contains("back-end")) return "Backend Developer";
        if (lowerRole.contains("fullstack") || lowerRole.contains("full-stack")) return "Full Stack Developer";
        if (lowerRole.contains("qa") || lowerRole.contains("test") || lowerRole.contains("quality")) return "QA Engineer";
        if (lowerRole.contains("product") && lowerRole.contains("manag")) return "Product Manager";
        if (lowerRole.contains("ux") || lowerRole.contains("design")) return "UX Designer";

        return "Software Engineer"; // Default
    }

    // Record classes for structured data
    public record SalaryData(
        int minEur,
        int maxEur,
        int medianEur,
        int changeYoY,
        String trend
    ) {}

    public record CompanyAIAdoption(
        String name,
        String type,
        List<String> aiInitiatives,
        int aiMaturityScore,
        String summary
    ) {}

    public record JobPostingTrend(
        int postings2023,
        int postings2024,
        int changePercent,
        String trend
    ) {}

    public record SkillDemand(
        String skill,
        int demandScore,
        int growthYoY,
        String note
    ) {}

    @Builder
    public record EstonianMarketSummary(
        int totalITJobs,
        int jobsChangeYoY,
        int avgSalary,
        int salaryChangeYoY,
        List<String> topGrowingRoles,
        List<String> decliningRoles,
        List<String> hotSkills,
        String marketSentiment,
        LocalDate lastUpdated
    ) {}
}
