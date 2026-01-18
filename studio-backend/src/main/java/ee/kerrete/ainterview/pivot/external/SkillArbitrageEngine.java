package ee.kerrete.ainterview.pivot.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Skill Arbitrage Engine - Find undervalued skills with highest ROI
 *
 * UNIQUE because this is like STOCK PICKING for your career:
 * - Identifies skills before they boom ("buy low")
 * - Calculates learning investment vs salary return
 * - Finds skill COMBINATIONS that multiply value
 * - Tracks skill "momentum" - rising before mainstream
 * - Shows "alpha" - skills that beat the market
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillArbitrageEngine {

    // Skill market data - salary premiums, demand growth, learning time
    private static final Map<String, SkillMarketData> SKILL_MARKET = Map.ofEntries(
            // === UNDERVALUED (Buy Now) ===
            Map.entry("rust", new SkillMarketData("Rust", 45000, 156, 6, 12, "undervalued",
                    "Memory-safe systems language. Demand growing faster than supply",
                    List.of("Systems programming", "WebAssembly", "Blockchain", "Embedded"))),

            Map.entry("go", new SkillMarketData("Go", 35000, 89, 4, 15, "undervalued",
                    "Cloud-native standard. Every K8s tool written in Go",
                    List.of("Cloud infrastructure", "DevOps", "Microservices", "CLI tools"))),

            Map.entry("duckdb", new SkillMarketData("DuckDB", 25000, 340, 2, 3, "undervalued",
                    "Embedded analytics. The SQLite of OLAP. Exploding in data tools",
                    List.of("Data engineering", "Analytics", "Edge computing"))),

            Map.entry("rag", new SkillMarketData("RAG Architecture", 55000, 890, 3, 5, "undervalued",
                    "Retrieval Augmented Generation. Every enterprise AI app needs this",
                    List.of("AI/ML", "Enterprise AI", "Search", "Knowledge systems"))),

            Map.entry("wasm", new SkillMarketData("WebAssembly", 30000, 120, 4, 8, "undervalued",
                    "Run anywhere at near-native speed. Edge computing future",
                    List.of("Edge computing", "Browser apps", "Serverless", "Plugins"))),

            Map.entry("nix", new SkillMarketData("Nix/NixOS", 20000, 85, 6, 4, "undervalued",
                    "Reproducible builds. DevEx teams adopting rapidly",
                    List.of("DevOps", "Platform engineering", "Developer experience"))),

            // === FAIRLY VALUED (Hold) ===
            Map.entry("kubernetes", new SkillMarketData("Kubernetes", 30000, 25, 4, 45, "fair",
                    "Industry standard. Good premium but competitive",
                    List.of("Platform engineering", "DevOps", "SRE"))),

            Map.entry("typescript", new SkillMarketData("TypeScript", 20000, 15, 2, 65, "fair",
                    "Default for frontend. Expected, not premium",
                    List.of("Frontend", "Full-stack", "Node.js"))),

            Map.entry("python", new SkillMarketData("Python", 15000, 8, 2, 85, "fair",
                    "Universal language. High demand but high supply",
                    List.of("Data science", "Backend", "ML", "Scripting"))),

            Map.entry("aws", new SkillMarketData("AWS", 25000, 12, 3, 82, "fair",
                    "Market leader but certifications are table stakes now",
                    List.of("Cloud", "DevOps", "Solutions architecture"))),

            // === OVERVALUED (Sell/Avoid Learning) ===
            Map.entry("blockchain", new SkillMarketData("Blockchain/Web3", -5000, -45, 6, 8, "overvalued",
                    "Hype collapsed. Only niche demand remains",
                    List.of("Crypto exchanges", "DeFi (shrinking)"))),

            Map.entry("prompt-engineering", new SkillMarketData("Prompt Engineering", 10000, -25, 1, 35, "overvalued",
                    "Saturated. Everyone claims this. Low barrier = low premium",
                    List.of("Content", "Marketing"))),

            Map.entry("react", new SkillMarketData("React", 10000, -5, 2, 78, "overvalued",
                    "Expected baseline. No premium for knowing React alone",
                    List.of("Frontend"))),

            Map.entry("java", new SkillMarketData("Java", 5000, -8, 3, 72, "overvalued",
                    "Enterprise demand stable but premium declining",
                    List.of("Enterprise", "Android (declining)"))),

            // === HIGH ALPHA (Skill Combinations) ===
            Map.entry("mlops", new SkillMarketData("MLOps", 50000, 145, 5, 18, "alpha",
                    "Bridge ML and production. Rare combination commands premium",
                    List.of("ML platforms", "AI infrastructure", "Data engineering"))),

            Map.entry("platform-engineering", new SkillMarketData("Platform Engineering", 45000, 78, 6, 12, "alpha",
                    "Internal developer platforms. New discipline, few experts",
                    List.of("DevEx", "Infrastructure", "Internal tools"))),

            Map.entry("ai-security", new SkillMarketData("AI Security", 60000, 230, 6, 5, "alpha",
                    "Securing LLMs. Critical need, almost no one has this",
                    List.of("Security", "AI/ML", "Compliance")))
    );

    @Cacheable(value = "skill-arbitrage", key = "#currentSkills.hashCode()")
    public ArbitrageReport analyzeOpportunities(List<String> currentSkills, String currentRole, int yearsExperience) {
        log.info("Analyzing skill arbitrage for {} skills, role: {}", currentSkills.size(), currentRole);

        var portfolio = buildSkillPortfolio(currentSkills);
        var buySignals = findBuySignals(currentSkills);
        var sellSignals = findSellSignals(currentSkills);
        var combos = findHighValueCombinations(currentSkills);
        var quickWins = findQuickWins(currentSkills, yearsExperience);
        var longTermPlays = findLongTermPlays(currentSkills);
        var riskAnalysis = analyzePortfolioRisk(portfolio);

        return new ArbitrageReport(
                portfolio,
                buySignals,
                sellSignals,
                combos,
                quickWins,
                longTermPlays,
                riskAnalysis,
                calculateTotalUpside(buySignals, combos),
                generateStrategy(portfolio, buySignals, yearsExperience)
        );
    }

    private SkillPortfolio buildSkillPortfolio(List<String> skills) {
        int totalValue = 0;
        int totalRisk = 0;
        List<PortfolioPosition> positions = new ArrayList<>();

        for (String skill : skills) {
            String normalized = skill.toLowerCase().replaceAll("[^a-z0-9]", "");
            SkillMarketData data = SKILL_MARKET.get(normalized);

            if (data != null) {
                totalValue += data.salaryPremium();
                int risk = data.valuation().equals("overvalued") ? 70 :
                        data.valuation().equals("fair") ? 40 : 20;
                totalRisk += risk;

                positions.add(new PortfolioPosition(
                        data.name(),
                        data.salaryPremium(),
                        data.demandGrowth(),
                        data.valuation(),
                        risk
                ));
            }
        }

        int avgRisk = positions.isEmpty() ? 50 : totalRisk / positions.size();
        String diversification = positions.size() < 3 ? "low" :
                positions.size() < 6 ? "moderate" : "high";

        return new SkillPortfolio(
                positions,
                totalValue,
                avgRisk,
                diversification,
                calculatePortfolioGrade(positions)
        );
    }

    private List<BuySignal> findBuySignals(List<String> currentSkills) {
        Set<String> normalized = currentSkills.stream()
                .map(s -> s.toLowerCase().replaceAll("[^a-z0-9]", ""))
                .collect(Collectors.toSet());

        return SKILL_MARKET.values().stream()
                .filter(s -> s.valuation().equals("undervalued") || s.valuation().equals("alpha"))
                .filter(s -> !normalized.contains(s.name().toLowerCase().replaceAll("[^a-z0-9]", "")))
                .sorted((a, b) -> {
                    // Sort by ROI = salary premium / learning months
                    double roiA = (double) a.salaryPremium() / a.learningMonths();
                    double roiB = (double) b.salaryPremium() / b.learningMonths();
                    return Double.compare(roiB, roiA);
                })
                .limit(5)
                .map(s -> new BuySignal(
                        s.name(),
                        s.salaryPremium(),
                        s.demandGrowth(),
                        s.learningMonths(),
                        calculateROI(s),
                        s.reason(),
                        determineUrgency(s),
                        s.industries()
                ))
                .collect(Collectors.toList());
    }

    private List<SellSignal> findSellSignals(List<String> currentSkills) {
        Set<String> normalized = currentSkills.stream()
                .map(s -> s.toLowerCase().replaceAll("[^a-z0-9]", ""))
                .collect(Collectors.toSet());

        return SKILL_MARKET.values().stream()
                .filter(s -> s.valuation().equals("overvalued"))
                .filter(s -> normalized.contains(s.name().toLowerCase().replaceAll("[^a-z0-9]", "")))
                .map(s -> new SellSignal(
                        s.name(),
                        s.salaryPremium(),
                        s.demandGrowth(),
                        s.reason(),
                        suggestReplacement(s),
                        "Don't invest more time. Maintain but pivot focus"
                ))
                .collect(Collectors.toList());
    }

    private List<SkillCombo> findHighValueCombinations(List<String> currentSkills) {
        List<SkillCombo> combos = new ArrayList<>();

        // Define powerful combinations
        List<ComboDefinition> allCombos = List.of(
                new ComboDefinition("Full-Stack AI", List.of("python", "typescript", "rag"),
                        75000, "Build complete AI applications front-to-back"),
                new ComboDefinition("Cloud Native", List.of("go", "kubernetes", "terraform"),
                        65000, "Platform engineering power combo"),
                new ComboDefinition("Systems + Safety", List.of("rust", "go", "linux"),
                        70000, "High-performance infrastructure"),
                new ComboDefinition("Data Platform", List.of("python", "duckdb", "mlops"),
                        60000, "Modern data stack mastery"),
                new ComboDefinition("AI Security", List.of("python", "security", "mlops"),
                        80000, "Unicorn combo - almost no one has this"),
                new ComboDefinition("Developer Experience", List.of("typescript", "go", "nix"),
                        55000, "Internal tools and DevEx expertise")
        );

        Set<String> normalized = currentSkills.stream()
                .map(s -> s.toLowerCase().replaceAll("[^a-z0-9]", ""))
                .collect(Collectors.toSet());

        for (var combo : allCombos) {
            long hasCount = combo.skills().stream()
                    .filter(s -> normalized.contains(s.toLowerCase()))
                    .count();
            List<String> missing = combo.skills().stream()
                    .filter(s -> !normalized.contains(s.toLowerCase()))
                    .collect(Collectors.toList());

            if (hasCount > 0 && missing.size() <= 2) {
                int completionPercent = (int) ((hasCount * 100) / combo.skills().size());
                combos.add(new SkillCombo(
                        combo.name(),
                        combo.salaryPremium(),
                        completionPercent,
                        missing,
                        combo.description(),
                        missing.size() <= 1 ? "high" : "medium"
                ));
            }
        }

        return combos.stream()
                .sorted((a, b) -> b.completionPercent() - a.completionPercent())
                .collect(Collectors.toList());
    }

    private List<QuickWin> findQuickWins(List<String> currentSkills, int yearsExperience) {
        return SKILL_MARKET.values().stream()
                .filter(s -> s.learningMonths() <= 3)
                .filter(s -> s.salaryPremium() >= 15000)
                .sorted((a, b) -> {
                    double roiA = (double) a.salaryPremium() / a.learningMonths();
                    double roiB = (double) b.salaryPremium() / b.learningMonths();
                    return Double.compare(roiB, roiA);
                })
                .limit(3)
                .map(s -> new QuickWin(
                        s.name(),
                        s.learningMonths() + " months",
                        "$" + s.salaryPremium() + "/year premium",
                        getQuickWinPath(s),
                        calculateROI(s)
                ))
                .collect(Collectors.toList());
    }

    private List<LongTermPlay> findLongTermPlays(List<String> currentSkills) {
        return List.of(
                new LongTermPlay(
                        "AI Infrastructure Expert",
                        "18-24 months",
                        "+$80-120K potential",
                        List.of("Python ML basics", "MLOps", "Vector DBs", "LLM deployment"),
                        "AI is not a bubble. Infrastructure will be needed regardless of which models win"
                ),
                new LongTermPlay(
                        "Platform Engineering Lead",
                        "12-18 months",
                        "+$60-80K potential",
                        List.of("Go/Rust", "Kubernetes", "Developer experience", "Internal tools"),
                        "Every company is building internal platforms. Demand will grow 5+ years"
                ),
                new LongTermPlay(
                        "Security + AI Specialist",
                        "12-18 months",
                        "+$90-130K potential",
                        List.of("Security fundamentals", "LLM vulnerabilities", "AI red teaming"),
                        "Regulation coming. Every AI deployment will need security review"
                )
        );
    }

    private PortfolioRisk analyzePortfolioRisk(SkillPortfolio portfolio) {
        long overvalued = portfolio.positions().stream()
                .filter(p -> "overvalued".equals(p.valuation()))
                .count();
        long undervalued = portfolio.positions().stream()
                .filter(p -> "undervalued".equals(p.valuation()) || "alpha".equals(p.valuation()))
                .count();

        String exposure;
        String recommendation;

        if (overvalued > undervalued) {
            exposure = "high-risk";
            recommendation = "Portfolio tilted toward declining skills. Rebalance urgently";
        } else if (undervalued > overvalued + 1) {
            exposure = "growth";
            recommendation = "Well-positioned for future. Continue current trajectory";
        } else {
            exposure = "balanced";
            recommendation = "Stable but consider adding emerging skills for upside";
        }

        List<String> risks = new ArrayList<>();
        if (portfolio.diversification().equals("low")) {
            risks.add("Low diversification - vulnerable to single skill decline");
        }
        if (overvalued >= 2) {
            risks.add(overvalued + " skills in decline - value erosion likely");
        }
        if (portfolio.avgRisk() > 50) {
            risks.add("Above-average portfolio risk");
        }

        return new PortfolioRisk(exposure, risks, recommendation, portfolio.avgRisk());
    }

    private int calculateTotalUpside(List<BuySignal> buys, List<SkillCombo> combos) {
        int fromBuys = buys.stream().mapToInt(BuySignal::salaryPremium).sum();
        int fromCombos = combos.stream()
                .filter(c -> c.completionPercent() >= 67)
                .mapToInt(SkillCombo::premiumPotential)
                .max().orElse(0);
        return fromBuys + fromCombos;
    }

    private String generateStrategy(SkillPortfolio portfolio, List<BuySignal> buys, int yearsExperience) {
        if (yearsExperience < 3) {
            return "JUNIOR STRATEGY: Focus on fundamentals first. Pick ONE undervalued skill (" +
                    (buys.isEmpty() ? "Go or Rust" : buys.get(0).skill()) +
                    ") and go deep. Avoid spreading thin.";
        } else if (yearsExperience < 7) {
            return "MID-LEVEL STRATEGY: Time to specialize. Complete a skill combo for maximum premium. " +
                    "Recommended next: " + (buys.isEmpty() ? "MLOps or Platform Engineering" : buys.get(0).skill());
        } else {
            return "SENIOR STRATEGY: Your time is expensive. Focus on highest-ROI skills only. " +
                    "Consider: AI Security, Staff+ leadership skills, or domain expertise monetization.";
        }
    }

    // Helper methods
    private int calculateROI(SkillMarketData skill) {
        // ROI = (salary premium / learning months) * 12 months = annual return per month invested
        return skill.learningMonths() > 0 ? (skill.salaryPremium() / skill.learningMonths()) : skill.salaryPremium();
    }

    private String determineUrgency(SkillMarketData skill) {
        if (skill.demandGrowth() > 100) return "NOW";
        if (skill.demandGrowth() > 50) return "3 months";
        if (skill.demandGrowth() > 20) return "6 months";
        return "12 months";
    }

    private String suggestReplacement(SkillMarketData skill) {
        return switch (skill.name().toLowerCase()) {
            case "react" -> "Keep React but add Rust/WASM or AI skills for differentiation";
            case "java" -> "Add Go or Kotlin. Keep Java for enterprise but don't invest more";
            case "blockchain" -> "Pivot to AI/ML. Similar complexity, actual demand";
            case "prompt-engineering" -> "Learn actual ML/RAG architecture instead";
            default -> "Maintain but focus learning time elsewhere";
        };
    }

    private String getQuickWinPath(SkillMarketData skill) {
        return switch (skill.name().toLowerCase()) {
            case "duckdb" -> "1. SQL refresher, 2. DuckDB tutorial, 3. Build analytics project";
            case "rag" -> "1. LangChain basics, 2. Vector DB setup, 3. Build RAG app";
            case "nix" -> "1. Nix pills tutorial, 2. Nixify a project, 3. Share with team";
            default -> "1. Official docs, 2. Build project, 3. Contribute to OSS";
        };
    }

    private String calculatePortfolioGrade(List<PortfolioPosition> positions) {
        if (positions.isEmpty()) return "F";

        double avgGrowth = positions.stream().mapToInt(PortfolioPosition::growthRate).average().orElse(0);
        long alphaCount = positions.stream().filter(p -> "alpha".equals(p.valuation())).count();

        if (alphaCount >= 2 && avgGrowth > 50) return "A+";
        if (alphaCount >= 1 && avgGrowth > 30) return "A";
        if (avgGrowth > 20) return "B+";
        if (avgGrowth > 0) return "B";
        if (avgGrowth > -10) return "C";
        return "D";
    }

    // ============ Records ============

    private record SkillMarketData(
            String name,
            int salaryPremium,
            int demandGrowth,
            int learningMonths,
            int marketShare,
            String valuation,
            String reason,
            List<String> industries
    ) {}

    private record ComboDefinition(String name, List<String> skills, int salaryPremium, String description) {}

    public record ArbitrageReport(
            SkillPortfolio currentPortfolio,
            List<BuySignal> buySignals,
            List<SellSignal> sellSignals,
            List<SkillCombo> combosNearCompletion,
            List<QuickWin> quickWins,
            List<LongTermPlay> longTermPlays,
            PortfolioRisk riskAnalysis,
            int totalUpsidePotential,
            String recommendedStrategy
    ) {}

    public record SkillPortfolio(
            List<PortfolioPosition> positions,
            int totalPremium,
            int avgRisk,
            String diversification,
            String grade
    ) {}

    public record PortfolioPosition(
            String skill,
            int premium,
            int growthRate,
            String valuation,
            int risk
    ) {}

    public record BuySignal(
            String skill,
            int salaryPremium,
            int demandGrowth,
            int learningMonths,
            int roiPerMonth,
            String reason,
            String urgency,
            List<String> industries
    ) {}

    public record SellSignal(
            String skill,
            int currentPremium,
            int demandGrowth,
            String reason,
            String replacement,
            String action
    ) {}

    public record SkillCombo(
            String name,
            int premiumPotential,
            int completionPercent,
            List<String> missingSkills,
            String description,
            String priority
    ) {}

    public record QuickWin(
            String skill,
            String timeToLearn,
            String premium,
            String learningPath,
            int roi
    ) {}

    public record LongTermPlay(
            String path,
            String timeframe,
            String potential,
            List<String> steps,
            String thesis
    ) {}

    public record PortfolioRisk(
            String exposure,
            List<String> risks,
            String recommendation,
            int riskScore
    ) {}
}
