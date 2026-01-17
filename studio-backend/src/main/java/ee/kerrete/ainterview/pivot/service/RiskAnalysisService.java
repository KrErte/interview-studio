package ee.kerrete.ainterview.pivot.service;

import ee.kerrete.ainterview.pivot.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskAnalysisService {

    public RiskAnalysisResponse getAnalysisForSession(String sessionId, String currentRole) {
        return RiskAnalysisResponse.builder()
                .threatVectors(generateThreatVectors(currentRole))
                .skillMatrix(generateSkillMatrix(currentRole))
                .vitalSigns(generateVitalSigns())
                .aiMilestones(generateAIMilestones())
                .scenarios(generateScenarios())
                .skillDecay(generateSkillDecay(currentRole))
                .marketSignals(generateMarketSignals(currentRole))
                .marketMetrics(generateMarketMetrics())
                .disruptedRoles(generateDisruptedRoles())
                .build();
    }

    public List<ThreatVectorDto> getThreatVectors(String sessionId, String currentRole) {
        return generateThreatVectors(currentRole);
    }

    public List<SkillCellDto> getSkillMatrix(String sessionId, String currentRole) {
        return generateSkillMatrix(currentRole);
    }

    public List<VitalSignDto> getVitalSigns(String sessionId) {
        return generateVitalSigns();
    }

    public List<AIMilestoneDto> getAIMilestones(String sessionId) {
        return generateAIMilestones();
    }

    public List<ScenarioDto> getScenarios(String sessionId) {
        return generateScenarios();
    }

    public List<SkillDecayDto> getSkillDecay(String sessionId, String currentRole) {
        return generateSkillDecay(currentRole);
    }

    public List<MarketSignalDto> getMarketSignals(String sessionId, String currentRole) {
        return generateMarketSignals(currentRole);
    }

    public List<MarketMetricDto> getMarketMetrics(String sessionId) {
        return generateMarketMetrics();
    }

    public List<DisruptedRoleDto> getDisruptedRoles(String sessionId) {
        return generateDisruptedRoles();
    }

    private List<ThreatVectorDto> generateThreatVectors(String role) {
        return Arrays.asList(
                ThreatVectorDto.builder()
                        .id("code-gen")
                        .label("Code Generation")
                        .severity(78)
                        .category("automation")
                        .eta("6 months")
                        .description("AI models now generate production-quality code for standard patterns")
                        .build(),
                ThreatVectorDto.builder()
                        .id("data-analysis")
                        .label("Data Analysis")
                        .severity(65)
                        .category("automation")
                        .eta("1 year")
                        .description("Automated insights generation replacing manual analysis workflows")
                        .build(),
                ThreatVectorDto.builder()
                        .id("offshore")
                        .label("Global Talent Pool")
                        .severity(52)
                        .category("outsourcing")
                        .eta("18 months")
                        .description("Remote-first culture enabling access to global specialists at lower cost")
                        .build(),
                ThreatVectorDto.builder()
                        .id("no-code")
                        .label("No-Code Platforms")
                        .severity(45)
                        .category("obsolescence")
                        .eta("2 years")
                        .description("Business users now build applications without traditional coding")
                        .build(),
                ThreatVectorDto.builder()
                        .id("ai-natives")
                        .label("AI-Native Workforce")
                        .severity(38)
                        .category("competition")
                        .eta("3 years")
                        .description("New graduates entering with native AI collaboration skills")
                        .build()
        );
    }

    private List<SkillCellDto> generateSkillMatrix(String role) {
        return Arrays.asList(
                SkillCellDto.builder().skill("Python").currentLevel(85).aiCapability(90).demandTrend("stable").category("Programming").build(),
                SkillCellDto.builder().skill("JavaScript").currentLevel(80).aiCapability(88).demandTrend("stable").category("Programming").build(),
                SkillCellDto.builder().skill("SQL").currentLevel(75).aiCapability(95).demandTrend("declining").category("Programming").build(),
                SkillCellDto.builder().skill("API Design").currentLevel(70).aiCapability(60).demandTrend("rising").category("Architecture").build(),
                SkillCellDto.builder().skill("System Design").currentLevel(65).aiCapability(40).demandTrend("rising").category("Architecture").build(),
                SkillCellDto.builder().skill("Documentation").currentLevel(60).aiCapability(85).demandTrend("declining").category("Communication").build(),
                SkillCellDto.builder().skill("Code Review").currentLevel(75).aiCapability(70).demandTrend("stable").category("Communication").build(),
                SkillCellDto.builder().skill("Stakeholder Mgmt").currentLevel(55).aiCapability(15).demandTrend("rising").category("Leadership").build(),
                SkillCellDto.builder().skill("Team Mentoring").currentLevel(50).aiCapability(10).demandTrend("rising").category("Leadership").build(),
                SkillCellDto.builder().skill("Testing").currentLevel(70).aiCapability(82).demandTrend("declining").category("Quality").build(),
                SkillCellDto.builder().skill("Debugging").currentLevel(80).aiCapability(75).demandTrend("stable").category("Quality").build(),
                SkillCellDto.builder().skill("Performance Opt.").currentLevel(60).aiCapability(55).demandTrend("stable").category("Quality").build()
        );
    }

    private List<VitalSignDto> generateVitalSigns() {
        return Arrays.asList(
                VitalSignDto.builder()
                        .id("market-demand").label("Market Demand").value(72).unit("idx")
                        .min(0).max(100).optimalMin(60).optimalMax(100).trend("down")
                        .history(Arrays.asList(85, 82, 80, 78, 76, 75, 74, 73, 72, 72, 72, 72))
                        .build(),
                VitalSignDto.builder()
                        .id("skill-currency").label("Skill Currency").value(68).unit("%")
                        .min(0).max(100).optimalMin(75).optimalMax(100).trend("down")
                        .history(Arrays.asList(88, 85, 82, 79, 76, 74, 72, 70, 69, 68, 68, 68))
                        .build(),
                VitalSignDto.builder()
                        .id("ai-collaboration").label("AI Collaboration").value(45).unit("%")
                        .min(0).max(100).optimalMin(60).optimalMax(100).trend("up")
                        .history(Arrays.asList(20, 25, 28, 32, 35, 38, 40, 42, 43, 44, 45, 45))
                        .build(),
                VitalSignDto.builder()
                        .id("adaptability").label("Adaptability Score").value(82).unit("pts")
                        .min(0).max(100).optimalMin(70).optimalMax(100).trend("stable")
                        .history(Arrays.asList(80, 81, 80, 82, 81, 82, 83, 82, 81, 82, 82, 82))
                        .build(),
                VitalSignDto.builder()
                        .id("learning-velocity").label("Learning Velocity").value(56).unit("u/mo")
                        .min(0).max(100).optimalMin(50).optimalMax(100).trend("up")
                        .history(Arrays.asList(40, 42, 44, 46, 48, 50, 51, 52, 54, 55, 56, 56))
                        .build(),
                VitalSignDto.builder()
                        .id("network-strength").label("Network Strength").value(38).unit("conn")
                        .min(0).max(100).optimalMin(50).optimalMax(100).trend("stable")
                        .history(Arrays.asList(35, 36, 36, 37, 37, 37, 38, 38, 38, 38, 38, 38))
                        .build()
        );
    }

    private List<AIMilestoneDto> generateAIMilestones() {
        int currentYear = Year.now().getValue();
        return Arrays.asList(
                AIMilestoneDto.builder()
                        .year(2024).capability("Automated Code Suggestions")
                        .description("AI provides real-time code completions and suggestions")
                        .impact("medium").probability(100).status("past")
                        .affectedTasks(Arrays.asList("Basic coding", "Boilerplate generation", "Simple refactoring"))
                        .build(),
                AIMilestoneDto.builder()
                        .year(2025).capability("Autonomous Bug Fixing")
                        .description("AI identifies and fixes common bugs without human intervention")
                        .impact("high").probability(85).status("imminent")
                        .affectedTasks(Arrays.asList("Debugging", "Error resolution", "Test maintenance", "Patch generation"))
                        .build(),
                AIMilestoneDto.builder()
                        .year(2026).capability("Full Feature Implementation")
                        .description("AI builds complete features from natural language specifications")
                        .impact("critical").probability(70).status("projected")
                        .affectedTasks(Arrays.asList("Feature development", "CRUD operations", "API development", "UI implementation"))
                        .build(),
                AIMilestoneDto.builder()
                        .year(2027).capability("Architecture Design")
                        .description("AI proposes and validates system architectures autonomously")
                        .impact("high").probability(55).status("projected")
                        .affectedTasks(Arrays.asList("System design", "Tech stack decisions", "Scalability planning"))
                        .build(),
                AIMilestoneDto.builder()
                        .year(2029).capability("Strategic Technical Leadership")
                        .description("AI provides strategic technology recommendations at executive level")
                        .impact("medium").probability(35).status("projected")
                        .affectedTasks(Arrays.asList("Roadmap planning", "Resource allocation", "Vendor evaluation"))
                        .build()
        );
    }

    private List<ScenarioDto> generateScenarios() {
        return Arrays.asList(
                ScenarioDto.builder()
                        .id("learn-ai").action("Learn AI/ML Engineering").timeInvestment("6 months")
                        .riskChange(-18).salaryChange(25).demandChange(40)
                        .description("Complete a comprehensive AI/ML certification and build 3 portfolio projects")
                        .build(),
                ScenarioDto.builder()
                        .id("pivot-pm").action("Pivot to Technical PM").timeInvestment("3 months")
                        .riskChange(-12).salaryChange(15).demandChange(20)
                        .description("Transition from IC to product management leveraging technical background")
                        .build(),
                ScenarioDto.builder()
                        .id("specialize-security").action("Specialize in AI Security").timeInvestment("4 months")
                        .riskChange(-22).salaryChange(30).demandChange(55)
                        .description("Focus on emerging AI security challenges - adversarial ML, model safety")
                        .build(),
                ScenarioDto.builder()
                        .id("start-consulting").action("Start AI Consulting").timeInvestment("2 months")
                        .riskChange(-8).salaryChange(40).demandChange(15)
                        .description("Leverage expertise to consult for companies implementing AI solutions")
                        .build(),
                ScenarioDto.builder()
                        .id("build-audience").action("Build Technical Audience").timeInvestment("12 months")
                        .riskChange(-15).salaryChange(20).demandChange(25)
                        .description("Create content, build newsletter, establish thought leadership")
                        .build(),
                ScenarioDto.builder()
                        .id("stay-course").action("Stay Current Path").timeInvestment("0 months")
                        .riskChange(8).salaryChange(3).demandChange(-10)
                        .description("Continue current trajectory without major changes")
                        .build()
        );
    }

    private List<SkillDecayDto> generateSkillDecay(String role) {
        return Arrays.asList(
                SkillDecayDto.builder()
                        .skill("jQuery").halfLife("18 months").currentRelevance(35).lastUpdated("2019")
                        .decayRate("fast").renewalAction("Migrate to React/Vue - jQuery is legacy")
                        .build(),
                SkillDecayDto.builder()
                        .skill("REST API Design").halfLife("36 months").currentRelevance(78).lastUpdated("2023")
                        .decayRate("moderate").renewalAction("Learn GraphQL and gRPC patterns")
                        .build(),
                SkillDecayDto.builder()
                        .skill("Manual Testing").halfLife("24 months").currentRelevance(45).lastUpdated("2022")
                        .decayRate("fast").renewalAction("Adopt AI-powered testing frameworks")
                        .build(),
                SkillDecayDto.builder()
                        .skill("System Design").halfLife("48 months").currentRelevance(85).lastUpdated("2024")
                        .decayRate("slow").renewalAction("Study AI-native architecture patterns")
                        .build(),
                SkillDecayDto.builder()
                        .skill("Kubernetes").halfLife("30 months").currentRelevance(72).lastUpdated("2023")
                        .decayRate("moderate").renewalAction("Explore serverless and edge computing")
                        .build(),
                SkillDecayDto.builder()
                        .skill("SQL Optimization").halfLife("42 months").currentRelevance(68).lastUpdated("2022")
                        .decayRate("slow").renewalAction("Learn vector databases and AI-native data stores")
                        .build()
        );
    }

    private List<MarketSignalDto> generateMarketSignals(String role) {
        return Arrays.asList(
                MarketSignalDto.builder()
                        .id("1").type("opportunity").title("Anthropic hiring Senior Engineers")
                        .source("LinkedIn").timeAgo("2h ago").relevanceScore(92)
                        .details("15 new positions opened for engineers with Python/TypeScript experience. Strong match with your profile.")
                        .actionable(true).action("View Positions")
                        .build(),
                MarketSignalDto.builder()
                        .id("2").type("warning").title("Meta reduces engineering headcount")
                        .source("TechCrunch").timeAgo("4h ago").relevanceScore(78)
                        .details("Company announces 10% reduction in engineering roles. May increase competition in your job market.")
                        .actionable(false).action(null)
                        .build(),
                MarketSignalDto.builder()
                        .id("3").type("trend").title("Rust demand up 45% this quarter")
                        .source("Stack Overflow Jobs").timeAgo("6h ago").relevanceScore(65)
                        .details("Systems programming skills becoming more valuable. Consider adding to your toolkit.")
                        .actionable(true).action("Learning Path")
                        .build(),
                MarketSignalDto.builder()
                        .id("4").type("opportunity").title("Your skills match: Stripe Backend Role")
                        .source("Direct Match").timeAgo("8h ago").relevanceScore(88)
                        .details("Based on your experience with APIs and payment systems. $180-220K range.")
                        .actionable(true).action("Quick Apply")
                        .build(),
                MarketSignalDto.builder()
                        .id("5").type("layoff").title("Tech layoffs continue in Q1")
                        .source("layoffs.fyi").timeAgo("12h ago").relevanceScore(70)
                        .details("23,000 tech workers laid off this month. Defensive positioning recommended.")
                        .actionable(true).action("Review Plan")
                        .build(),
                MarketSignalDto.builder()
                        .id("6").type("trend").title("AI-assisted coding now standard")
                        .source("GitHub Survey").timeAgo("1d ago").relevanceScore(95)
                        .details("78% of developers now use AI coding assistants daily. Adapt or fall behind.")
                        .actionable(true).action("AI Skills Guide")
                        .build()
        );
    }

    private List<MarketMetricDto> generateMarketMetrics() {
        return Arrays.asList(
                MarketMetricDto.builder().label("Open Roles").value("2.4K").change(-12).trend("down").build(),
                MarketMetricDto.builder().label("Avg Salary").value("$142K").change(3).trend("up").build(),
                MarketMetricDto.builder().label("AI Adoption").value("67%").change(15).trend("up").build(),
                MarketMetricDto.builder().label("Remote %").value("45%").change(-5).trend("down").build()
        );
    }

    private List<DisruptedRoleDto> generateDisruptedRoles() {
        return Arrays.asList(
                DisruptedRoleDto.builder()
                        .title("Travel Agent").peakYear(2000).currentStatus("disrupted")
                        .peakEmployment("124K").currentEmployment("58K").decline(53)
                        .disruptors(Arrays.asList("Online Booking (Expedia)", "Price Comparison Sites", "Airline Direct Sales", "Mobile Apps"))
                        .timeline(Arrays.asList(
                                DisruptedRoleDto.TimelineEventDto.builder().year(1996).event("Expedia and Travelocity launch online booking").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2000).event("Peak employment - most bookings still through agents").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2005).event("Airlines eliminate agent commissions").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2010).event("Mobile booking apps emerge").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2020).event("COVID accelerates digital adoption").build()
                        ))
                        .survivors(Arrays.asList(
                                "Specialized in luxury/complex travel",
                                "Built corporate client relationships",
                                "Became 'travel advisors' with expertise",
                                "Created niche (honeymoons, adventure, accessible travel)"
                        ))
                        .lessons(Arrays.asList(
                                "Commoditized tasks get automated first",
                                "Expertise and relationships are defensible",
                                "Pivot to complexity, not volume"
                        ))
                        .build(),
                DisruptedRoleDto.builder()
                        .title("Bank Teller").peakYear(2007).currentStatus("declining")
                        .peakEmployment("600K").currentEmployment("400K").decline(33)
                        .disruptors(Arrays.asList("ATMs", "Online Banking", "Mobile Deposits", "Cryptocurrency"))
                        .timeline(Arrays.asList(
                                DisruptedRoleDto.TimelineEventDto.builder().year(1970).event("First ATMs deployed").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(1995).event("Online banking begins").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2007).event("Peak employment before smartphone era").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2014).event("Mobile check deposit becomes standard").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2020).event("Branch visits drop 50% during pandemic").build()
                        ))
                        .survivors(Arrays.asList(
                                "Transitioned to 'universal bankers' with advisory role",
                                "Moved into loan origination and wealth management",
                                "Specialized in business banking relationships",
                                "Became branch managers focusing on complex services"
                        ))
                        .lessons(Arrays.asList(
                                "Routine transactions are first to automate",
                                "Advisory and relationship roles persist longer",
                                "Physical presence still valued for complex decisions"
                        ))
                        .build(),
                DisruptedRoleDto.builder()
                        .title("Paralegal").peakYear(2019).currentStatus("transformed")
                        .peakEmployment("325K").currentEmployment("290K").decline(11)
                        .disruptors(Arrays.asList("E-discovery Software", "Contract AI (Kira)", "Document Automation", "LegalZoom"))
                        .timeline(Arrays.asList(
                                DisruptedRoleDto.TimelineEventDto.builder().year(2010).event("E-discovery tools reduce document review time 90%").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2015).event("Contract analysis AI enters market").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2019).event("GPT-2 shows potential for legal writing").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2023).event("ChatGPT disrupts routine legal research").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2024).event("AI handles 60% of document preparation").build()
                        ))
                        .survivors(Arrays.asList(
                                "Became AI tool operators and quality reviewers",
                                "Specialized in litigation support and trial prep",
                                "Moved into compliance and regulatory roles",
                                "Built expertise in specific legal domains (IP, healthcare)"
                        ))
                        .lessons(Arrays.asList(
                                "Research and document work is highly automatable",
                                "Being an AI operator is a valid career pivot",
                                "Domain expertise + tech skills = job security"
                        ))
                        .build(),
                DisruptedRoleDto.builder()
                        .title("Junior Developer").peakYear(2023).currentStatus("transformed")
                        .peakEmployment("2.1M").currentEmployment("1.8M").decline(14)
                        .disruptors(Arrays.asList("GitHub Copilot", "ChatGPT/Claude", "No-Code Platforms", "AI Code Generation"))
                        .timeline(Arrays.asList(
                                DisruptedRoleDto.TimelineEventDto.builder().year(2021).event("GitHub Copilot public preview").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2022).event("ChatGPT shows coding capabilities").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2023).event("Entry-level hiring drops 40% at major tech companies").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2024).event("AI handles most boilerplate and CRUD operations").build(),
                                DisruptedRoleDto.TimelineEventDto.builder().year(2025).event("Junior role redefines as 'AI-assisted developer'").build()
                        ))
                        .survivors(Arrays.asList(
                                "Became AI-assisted developers producing 3-5x output",
                                "Specialized in AI/ML engineering and prompt engineering",
                                "Moved to roles requiring human judgment (security, architecture)",
                                "Built domain expertise (fintech, healthcare, etc.)"
                        ))
                        .lessons(Arrays.asList(
                                "Coding alone is not enough - need systems thinking",
                                "AI collaboration skills are now required",
                                "Specialization beats generalization",
                                "The role is transforming, not disappearing"
                        ))
                        .build()
        );
    }
}
