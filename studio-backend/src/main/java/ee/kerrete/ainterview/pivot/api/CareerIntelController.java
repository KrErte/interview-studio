package ee.kerrete.ainterview.pivot.api;

import ee.kerrete.ainterview.pivot.external.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Career Intelligence API - Unique analysis endpoints
 *
 * These endpoints provide DIFFERENTIATED value:
 * - Real GitHub profile analysis
 * - Job market X-ray
 * - Company health/layoff prediction
 * - Skill arbitrage opportunities
 */
@Slf4j
@RestController
@RequestMapping({"/api/studio/career-intel", "/api/career-intel"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CareerIntelController {

    private final GitHubProfileAnalyzer githubAnalyzer;
    private final JobPostingXRay jobXRay;
    private final CompanyHealthRadar companyRadar;
    private final SkillArbitrageEngine arbitrageEngine;

    // ============ GitHub Career DNA ============

    /**
     * Analyze a GitHub profile to create "Career DNA"
     * GET /api/career-intel/github/{username}
     */
    @GetMapping("/github/{username}")
    public ResponseEntity<GitHubProfileAnalyzer.CareerDNA> analyzeGitHub(
            @PathVariable String username) {
        log.info("Analyzing GitHub profile: {}", username);
        return ResponseEntity.ok(githubAnalyzer.analyzeProfile(username));
    }

    // ============ Job Market X-Ray ============

    /**
     * X-ray the job market for a specific role
     * GET /api/career-intel/jobs?role=Software%20Engineer
     */
    @GetMapping("/jobs")
    public ResponseEntity<JobPostingXRay.JobMarketXRay> analyzeJobMarket(
            @RequestParam(defaultValue = "Software Engineer") String role) {
        log.info("Analyzing job market for: {}", role);
        return ResponseEntity.ok(jobXRay.analyzeMarket(role));
    }

    // ============ Company Health Radar ============

    /**
     * Analyze company health and layoff probability
     * GET /api/career-intel/company/{name}
     */
    @GetMapping("/company/{name}")
    public ResponseEntity<CompanyHealthRadar.CompanyHealthReport> analyzeCompany(
            @PathVariable String name) {
        log.info("Analyzing company health: {}", name);
        return ResponseEntity.ok(companyRadar.analyzeCompany(name));
    }

    /**
     * Compare multiple companies
     * POST /api/career-intel/companies
     * Body: ["Google", "Meta", "Amazon"]
     */
    @PostMapping("/companies")
    public ResponseEntity<List<CompanyHealthRadar.CompanyHealthReport>> compareCompanies(
            @RequestBody List<String> companies) {
        log.info("Comparing {} companies", companies.size());
        return ResponseEntity.ok(companyRadar.analyzeMultiple(companies));
    }

    // ============ Skill Arbitrage ============

    /**
     * Find skill arbitrage opportunities
     * POST /api/career-intel/arbitrage
     */
    @PostMapping("/arbitrage")
    public ResponseEntity<SkillArbitrageEngine.ArbitrageReport> analyzeSkillArbitrage(
            @RequestBody ArbitrageRequest request) {
        log.info("Analyzing skill arbitrage for {} skills", request.currentSkills().size());
        return ResponseEntity.ok(arbitrageEngine.analyzeOpportunities(
                request.currentSkills(),
                request.currentRole(),
                request.yearsExperience()
        ));
    }

    /**
     * Quick skill valuation
     * GET /api/career-intel/skill-value?skills=Python,TypeScript,React
     */
    @GetMapping("/skill-value")
    public ResponseEntity<SkillArbitrageEngine.ArbitrageReport> quickSkillValue(
            @RequestParam List<String> skills,
            @RequestParam(defaultValue = "Software Engineer") String role,
            @RequestParam(defaultValue = "3") int years) {
        log.info("Quick skill valuation for: {}", skills);
        return ResponseEntity.ok(arbitrageEngine.analyzeOpportunities(skills, role, years));
    }

    // ============ Combined Intelligence ============

    /**
     * Full career intelligence report
     * POST /api/career-intel/full-report
     */
    @PostMapping("/full-report")
    public ResponseEntity<FullCareerReport> getFullReport(
            @RequestBody FullReportRequest request) {
        log.info("Generating full career report for: {}", request.githubUsername());

        var githubDNA = request.githubUsername() != null && !request.githubUsername().isEmpty()
                ? githubAnalyzer.analyzeProfile(request.githubUsername())
                : null;

        var jobMarket = jobXRay.analyzeMarket(request.currentRole());

        var companyHealth = request.currentCompany() != null && !request.currentCompany().isEmpty()
                ? companyRadar.analyzeCompany(request.currentCompany())
                : null;

        var arbitrage = arbitrageEngine.analyzeOpportunities(
                request.skills(),
                request.currentRole(),
                request.yearsExperience()
        );

        return ResponseEntity.ok(new FullCareerReport(
                githubDNA,
                jobMarket,
                companyHealth,
                arbitrage,
                generateExecutiveSummary(githubDNA, jobMarket, companyHealth, arbitrage)
        ));
    }

    private String generateExecutiveSummary(
            GitHubProfileAnalyzer.CareerDNA github,
            JobPostingXRay.JobMarketXRay jobs,
            CompanyHealthRadar.CompanyHealthReport company,
            SkillArbitrageEngine.ArbitrageReport arbitrage) {

        StringBuilder summary = new StringBuilder();

        if (github != null && github.marketFitScore() > 0) {
            summary.append("GitHub market fit: ").append(github.marketFitScore()).append("/100. ");
        }

        if (company != null) {
            summary.append("Company risk: ").append(company.layoffRisk().level()).append(". ");
        }

        summary.append("Portfolio grade: ").append(arbitrage.currentPortfolio().grade()).append(". ");

        if (!arbitrage.buySignals().isEmpty()) {
            summary.append("Top opportunity: ").append(arbitrage.buySignals().get(0).skill());
            summary.append(" (+$").append(arbitrage.buySignals().get(0).salaryPremium()).append("/yr). ");
        }

        summary.append(arbitrage.recommendedStrategy());

        return summary.toString();
    }

    // ============ Request/Response Records ============

    public record ArbitrageRequest(
            List<String> currentSkills,
            String currentRole,
            int yearsExperience
    ) {}

    public record FullReportRequest(
            String githubUsername,
            String currentCompany,
            String currentRole,
            List<String> skills,
            int yearsExperience
    ) {}

    public record FullCareerReport(
            GitHubProfileAnalyzer.CareerDNA githubDNA,
            JobPostingXRay.JobMarketXRay jobMarket,
            CompanyHealthRadar.CompanyHealthReport companyHealth,
            SkillArbitrageEngine.ArbitrageReport skillArbitrage,
            String executiveSummary
    ) {}
}
