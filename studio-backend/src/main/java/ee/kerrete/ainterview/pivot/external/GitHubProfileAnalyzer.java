package ee.kerrete.ainterview.pivot.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Analyzes a user's ACTUAL GitHub profile to create their "Career DNA"
 *
 * This is UNIQUE because:
 * - Uses REAL data from their actual work
 * - Identifies rare skill combinations ("mutations")
 * - Calculates code velocity and consistency
 * - Detects skill gaps vs market demand
 * - Predicts career trajectory based on commit patterns
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubProfileAnalyzer {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GITHUB_API = "https://api.github.com";

    @Cacheable(value = "github-profile", key = "#username")
    public CareerDNA analyzeProfile(String username) {
        log.info("Analyzing GitHub profile for: {}", username);

        try {
            // Fetch user data
            var user = fetchUser(username);
            var repos = fetchRepos(username);
            var events = fetchEvents(username);

            // Analyze
            var languageBreakdown = analyzeLanguages(repos);
            var commitPatterns = analyzeCommitPatterns(events);
            var skillMutations = findSkillMutations(languageBreakdown, repos);
            var codeVelocity = calculateCodeVelocity(events);
            var consistency = calculateConsistency(events);
            var trajectory = predictTrajectory(languageBreakdown, commitPatterns, repos);
            var marketFit = calculateMarketFit(languageBreakdown);
            var extinctionRisks = findExtinctionRisks(languageBreakdown);

            return CareerDNA.builder()
                    .username(username)
                    .avatarUrl(user.get("avatar_url").asText())
                    .profileUrl(user.get("html_url").asText())
                    .publicRepos(user.get("public_repos").asInt())
                    .followers(user.get("followers").asInt())
                    .following(user.get("following").asInt())
                    .accountAge(calculateAccountAge(user.get("created_at").asText()))
                    .dominantSkills(extractDominantSkills(languageBreakdown))
                    .recessiveSkills(extractRecessiveSkills(languageBreakdown))
                    .skillMutations(skillMutations)
                    .codeVelocity(codeVelocity)
                    .consistencyScore(consistency)
                    .marketFitScore(marketFit)
                    .extinctionRisks(extinctionRisks)
                    .trajectory(trajectory)
                    .languageBreakdown(languageBreakdown)
                    .weeklyActivity(commitPatterns.weeklyActivity())
                    .peakCodingHour(commitPatterns.peakHour())
                    .mostActiveDay(commitPatterns.mostActiveDay())
                    .build();

        } catch (Exception e) {
            log.error("Failed to analyze GitHub profile: {}", e.getMessage());
            return createFallbackDNA(username);
        }
    }

    private JsonNode fetchUser(String username) {
        String url = GITHUB_API + "/users/" + username;
        var response = restTemplate.exchange(url, HttpMethod.GET, createHeaders(), String.class);
        try {
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse user data", e);
        }
    }

    private List<JsonNode> fetchRepos(String username) {
        String url = GITHUB_API + "/users/" + username + "/repos?per_page=100&sort=updated";
        var response = restTemplate.exchange(url, HttpMethod.GET, createHeaders(), String.class);
        try {
            JsonNode array = objectMapper.readTree(response.getBody());
            return StreamSupport.stream(array.spliterator(), false).collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<JsonNode> fetchEvents(String username) {
        String url = GITHUB_API + "/users/" + username + "/events?per_page=100";
        var response = restTemplate.exchange(url, HttpMethod.GET, createHeaders(), String.class);
        try {
            JsonNode array = objectMapper.readTree(response.getBody());
            return StreamSupport.stream(array.spliterator(), false).collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    private HttpEntity<String> createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");
        headers.set("User-Agent", "InterviewStudio-CareerAnalyzer");
        // Add token if available: headers.set("Authorization", "token " + githubToken);
        return new HttpEntity<>(headers);
    }

    private Map<String, LanguageStats> analyzeLanguages(List<JsonNode> repos) {
        Map<String, Long> languageBytes = new HashMap<>();
        Map<String, Integer> languageRepos = new HashMap<>();
        Map<String, String> lastUsed = new HashMap<>();

        for (var repo : repos) {
            String lang = repo.has("language") && !repo.get("language").isNull()
                    ? repo.get("language").asText() : null;
            if (lang != null) {
                languageBytes.merge(lang, repo.get("size").asLong() * 1024, Long::sum);
                languageRepos.merge(lang, 1, Integer::sum);
                String updatedAt = repo.get("updated_at").asText();
                lastUsed.merge(lang, updatedAt, (a, b) -> a.compareTo(b) > 0 ? a : b);
            }
        }

        long totalBytes = languageBytes.values().stream().mapToLong(Long::longValue).sum();

        Map<String, LanguageStats> result = new HashMap<>();
        for (var entry : languageBytes.entrySet()) {
            String lang = entry.getKey();
            result.put(lang, new LanguageStats(
                    lang,
                    (int) ((entry.getValue() * 100) / Math.max(1, totalBytes)),
                    languageRepos.get(lang),
                    entry.getValue(),
                    lastUsed.get(lang),
                    getMarketDemand(lang),
                    getAIThreat(lang)
            ));
        }

        return result;
    }

    private CommitPatterns analyzeCommitPatterns(List<JsonNode> events) {
        int[] hourCounts = new int[24];
        int[] dayCounts = new int[7];
        List<Integer> weeklyActivity = new ArrayList<>();

        Map<String, Integer> weeklyMap = new TreeMap<>();

        for (var event : events) {
            if ("PushEvent".equals(event.get("type").asText())) {
                String createdAt = event.get("created_at").asText();
                try {
                    var dt = java.time.ZonedDateTime.parse(createdAt);
                    hourCounts[dt.getHour()]++;
                    dayCounts[dt.getDayOfWeek().getValue() - 1]++;

                    String weekKey = dt.getYear() + "-W" + dt.get(java.time.temporal.WeekFields.ISO.weekOfYear());
                    int commits = event.get("payload").get("commits").size();
                    weeklyMap.merge(weekKey, commits, Integer::sum);
                } catch (Exception ignored) {}
            }
        }

        int peakHour = 0;
        for (int i = 1; i < 24; i++) {
            if (hourCounts[i] > hourCounts[peakHour]) peakHour = i;
        }

        int peakDay = 0;
        for (int i = 1; i < 7; i++) {
            if (dayCounts[i] > dayCounts[peakDay]) peakDay = i;
        }

        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};

        // Last 12 weeks
        weeklyActivity = weeklyMap.values().stream().skip(Math.max(0, weeklyMap.size() - 12)).collect(Collectors.toList());

        return new CommitPatterns(peakHour, days[peakDay], weeklyActivity);
    }

    private List<SkillMutation> findSkillMutations(Map<String, LanguageStats> languages, List<JsonNode> repos) {
        List<SkillMutation> mutations = new ArrayList<>();

        // Check for rare combinations
        Set<String> userLangs = languages.keySet();

        // Mutation: Full-stack polyglot (frontend + backend + infra)
        boolean hasFrontend = userLangs.stream().anyMatch(l -> Set.of("JavaScript", "TypeScript", "Vue", "Svelte").contains(l));
        boolean hasBackend = userLangs.stream().anyMatch(l -> Set.of("Java", "Go", "Python", "Rust", "C#").contains(l));
        boolean hasInfra = userLangs.stream().anyMatch(l -> Set.of("HCL", "Shell", "Dockerfile").contains(l));

        if (hasFrontend && hasBackend && hasInfra) {
            mutations.add(new SkillMutation(
                    "Full-Stack Polyglot",
                    "Rare combination of frontend, backend, AND infrastructure skills",
                    85,
                    "+35% salary premium",
                    List.of("Platform Engineering", "Staff+ roles", "Startup CTO")
            ));
        }

        // Mutation: Systems + Web (low-level + high-level)
        boolean hasLowLevel = userLangs.stream().anyMatch(l -> Set.of("Rust", "C", "C++", "Go").contains(l));
        boolean hasHighLevel = userLangs.stream().anyMatch(l -> Set.of("Python", "JavaScript", "Ruby").contains(l));

        if (hasLowLevel && hasHighLevel) {
            mutations.add(new SkillMutation(
                    "Systems Hybrid",
                    "Rare: Low-level systems knowledge + high-level productivity",
                    78,
                    "+40% salary premium",
                    List.of("Performance Engineering", "Infrastructure", "Compiler work")
            ));
        }

        // Mutation: AI/ML + Production Systems
        boolean hasML = userLangs.contains("Python") && repos.stream()
                .anyMatch(r -> {
                    String desc = r.has("description") && !r.get("description").isNull()
                            ? r.get("description").asText().toLowerCase() : "";
                    String name = r.get("name").asText().toLowerCase();
                    return desc.contains("ml") || desc.contains("machine learning") ||
                           desc.contains("tensorflow") || desc.contains("pytorch") ||
                           name.contains("ml") || name.contains("model");
                });

        if (hasML && hasBackend) {
            mutations.add(new SkillMutation(
                    "MLOps Unicorn",
                    "Can build ML models AND deploy them to production",
                    92,
                    "+50% salary premium",
                    List.of("ML Platform", "AI Infrastructure", "Applied AI Lead")
            ));
        }

        // Mutation: Open Source Contributor
        long forkedRepos = repos.stream().filter(r -> r.get("fork").asBoolean()).count();
        if (forkedRepos >= 5) {
            mutations.add(new SkillMutation(
                    "Open Source DNA",
                    "Active open source contributor - rare collaboration signal",
                    70,
                    "Community leverage",
                    List.of("Developer Relations", "Open Source Lead", "Technical Evangelist")
            ));
        }

        // Mutation: Consistent Shipper
        // (checked in consistency score)

        return mutations;
    }

    private CodeVelocity calculateCodeVelocity(List<JsonNode> events) {
        int totalCommits = 0;
        int totalPushes = 0;
        Set<String> uniqueRepos = new HashSet<>();

        for (var event : events) {
            if ("PushEvent".equals(event.get("type").asText())) {
                totalPushes++;
                totalCommits += event.get("payload").get("commits").size();
                uniqueRepos.add(event.get("repo").get("name").asText());
            }
        }

        // Events are last 90 days max
        double commitsPerWeek = totalCommits / 12.0;

        String velocity;
        int percentile;
        if (commitsPerWeek >= 50) {
            velocity = "hyperspeed";
            percentile = 99;
        } else if (commitsPerWeek >= 20) {
            velocity = "fast";
            percentile = 85;
        } else if (commitsPerWeek >= 10) {
            velocity = "steady";
            percentile = 60;
        } else if (commitsPerWeek >= 3) {
            velocity = "moderate";
            percentile = 40;
        } else {
            velocity = "slow";
            percentile = 20;
        }

        return new CodeVelocity(
                totalCommits,
                commitsPerWeek,
                uniqueRepos.size(),
                velocity,
                percentile
        );
    }

    private int calculateConsistency(List<JsonNode> events) {
        // Group events by week
        Map<String, Integer> weeklyCommits = new TreeMap<>();

        for (var event : events) {
            if ("PushEvent".equals(event.get("type").asText())) {
                String createdAt = event.get("created_at").asText();
                try {
                    var dt = java.time.ZonedDateTime.parse(createdAt);
                    String weekKey = dt.getYear() + "-W" + String.format("%02d", dt.get(java.time.temporal.WeekFields.ISO.weekOfYear()));
                    weeklyCommits.merge(weekKey, event.get("payload").get("commits").size(), Integer::sum);
                } catch (Exception ignored) {}
            }
        }

        if (weeklyCommits.size() < 4) return 30; // Not enough data

        // Calculate consistency = weeks with activity / total weeks
        long weeksWithActivity = weeklyCommits.values().stream().filter(c -> c > 0).count();
        int totalWeeks = weeklyCommits.size();

        return (int) ((weeksWithActivity * 100) / totalWeeks);
    }

    private CareerTrajectory predictTrajectory(Map<String, LanguageStats> languages,
            CommitPatterns patterns, List<JsonNode> repos) {

        // Analyze trends
        List<String> growingSkills = languages.values().stream()
                .filter(l -> l.marketDemand() > 70)
                .sorted((a, b) -> b.percentage() - a.percentage())
                .limit(3)
                .map(LanguageStats::language)
                .collect(Collectors.toList());

        List<String> atRiskSkills = languages.values().stream()
                .filter(l -> l.aiThreat() > 60)
                .map(LanguageStats::language)
                .collect(Collectors.toList());

        // Determine trajectory type
        String trajectoryType;
        String recommendation;
        int confidenceScore;

        boolean hasTrendingSkills = languages.keySet().stream()
                .anyMatch(l -> Set.of("Rust", "Go", "TypeScript", "Python").contains(l));
        boolean hasLegacyOnly = languages.keySet().stream()
                .allMatch(l -> Set.of("PHP", "Perl", "Visual Basic", "COBOL").contains(l));

        if (hasLegacyOnly) {
            trajectoryType = "legacy-maintenance";
            recommendation = "URGENT: Add modern language (TypeScript, Go, or Rust) to remain marketable";
            confidenceScore = 85;
        } else if (hasTrendingSkills && languages.size() >= 3) {
            trajectoryType = "growth";
            recommendation = "Strong trajectory. Consider specializing in " + growingSkills.get(0) + " for maximum impact";
            confidenceScore = 75;
        } else {
            trajectoryType = "stable";
            recommendation = "Solid foundation. Add AI/ML skills or infrastructure knowledge to accelerate";
            confidenceScore = 65;
        }

        // Calculate years to senior/staff based on activity
        int yearsToSenior = patterns.weeklyActivity().stream().mapToInt(i -> i).average().orElse(0) > 15 ? 2 : 4;

        return new CareerTrajectory(
                trajectoryType,
                growingSkills,
                atRiskSkills,
                recommendation,
                confidenceScore,
                yearsToSenior
        );
    }

    private int calculateMarketFit(Map<String, LanguageStats> languages) {
        // Weighted average of market demand
        double totalWeight = 0;
        double weightedDemand = 0;

        for (var lang : languages.values()) {
            double weight = lang.percentage() / 100.0;
            totalWeight += weight;
            weightedDemand += weight * lang.marketDemand();
        }

        return totalWeight > 0 ? (int) (weightedDemand / totalWeight) : 50;
    }

    private List<ExtinctionRisk> findExtinctionRisks(Map<String, LanguageStats> languages) {
        return languages.values().stream()
                .filter(l -> l.aiThreat() > 50 || l.marketDemand() < 40)
                .map(l -> new ExtinctionRisk(
                        l.language(),
                        l.aiThreat(),
                        l.marketDemand(),
                        getExtinctionReason(l),
                        getSurvivalStrategy(l)
                ))
                .collect(Collectors.toList());
    }

    private List<DominantSkill> extractDominantSkills(Map<String, LanguageStats> languages) {
        return languages.values().stream()
                .filter(l -> l.percentage() >= 15)
                .sorted((a, b) -> b.percentage() - a.percentage())
                .limit(4)
                .map(l -> new DominantSkill(l.language(), l.percentage(), l.repoCount(), l.marketDemand()))
                .collect(Collectors.toList());
    }

    private List<RecessiveSkill> extractRecessiveSkills(Map<String, LanguageStats> languages) {
        return languages.values().stream()
                .filter(l -> l.percentage() > 0 && l.percentage() < 15)
                .sorted((a, b) -> b.percentage() - a.percentage())
                .limit(5)
                .map(l -> new RecessiveSkill(l.language(), l.percentage(), l.lastUsed(), getActivationPotential(l)))
                .collect(Collectors.toList());
    }

    private int getMarketDemand(String language) {
        return switch (language) {
            case "Python" -> 95;
            case "TypeScript" -> 92;
            case "JavaScript" -> 88;
            case "Go" -> 85;
            case "Rust" -> 82;
            case "Java" -> 80;
            case "Kotlin" -> 78;
            case "C#" -> 75;
            case "Swift" -> 72;
            case "Ruby" -> 55;
            case "PHP" -> 50;
            case "Perl" -> 25;
            case "COBOL" -> 30; // Niche but paid well
            default -> 50;
        };
    }

    private int getAIThreat(String language) {
        // How much of this language's typical work can AI do?
        return switch (language) {
            case "Python" -> 75; // AI is very good at Python
            case "JavaScript" -> 72;
            case "TypeScript" -> 68;
            case "Java" -> 65;
            case "HTML" -> 85;
            case "CSS" -> 80;
            case "SQL" -> 70;
            case "Go" -> 55;
            case "Rust" -> 45; // AI struggles with ownership/lifetimes
            case "C++" -> 50;
            case "C" -> 45;
            case "Assembly" -> 25;
            case "Haskell" -> 40;
            default -> 60;
        };
    }

    private String getExtinctionReason(LanguageStats lang) {
        if (lang.aiThreat() > 70) {
            return "AI can generate " + lang.aiThreat() + "% of typical " + lang.language() + " code";
        }
        if (lang.marketDemand() < 40) {
            return "Market demand declining - fewer job postings each quarter";
        }
        return "Combination of AI automation and declining demand";
    }

    private String getSurvivalStrategy(LanguageStats lang) {
        if (lang.aiThreat() > 70) {
            return "Focus on architecture, code review, and complex systems - not line-by-line coding";
        }
        if (lang.marketDemand() < 40) {
            return "Transition to " + getSuggestedAlternative(lang.language()) + " - similar concepts, higher demand";
        }
        return "Specialize in complex, domain-specific applications of " + lang.language();
    }

    private String getSuggestedAlternative(String language) {
        return switch (language) {
            case "PHP" -> "TypeScript or Go";
            case "Perl" -> "Python";
            case "Ruby" -> "Python or TypeScript";
            case "CoffeeScript" -> "TypeScript";
            case "Objective-C" -> "Swift";
            default -> "TypeScript or Go";
        };
    }

    private String getActivationPotential(LanguageStats lang) {
        if (lang.marketDemand() > 80) return "high";
        if (lang.marketDemand() > 60) return "medium";
        return "low";
    }

    private int calculateAccountAge(String createdAt) {
        try {
            var created = LocalDate.parse(createdAt.substring(0, 10));
            return (int) ChronoUnit.YEARS.between(created, LocalDate.now());
        } catch (Exception e) {
            return 0;
        }
    }

    private CareerDNA createFallbackDNA(String username) {
        return CareerDNA.builder()
                .username(username)
                .error("Could not analyze profile - rate limited or not found")
                .build();
    }

    // ============ Records ============

    @lombok.Builder
    public record CareerDNA(
            String username,
            String avatarUrl,
            String profileUrl,
            int publicRepos,
            int followers,
            int following,
            int accountAge,
            List<DominantSkill> dominantSkills,
            List<RecessiveSkill> recessiveSkills,
            List<SkillMutation> skillMutations,
            CodeVelocity codeVelocity,
            int consistencyScore,
            int marketFitScore,
            List<ExtinctionRisk> extinctionRisks,
            CareerTrajectory trajectory,
            Map<String, LanguageStats> languageBreakdown,
            List<Integer> weeklyActivity,
            int peakCodingHour,
            String mostActiveDay,
            String error
    ) {}

    public record LanguageStats(
            String language,
            int percentage,
            int repoCount,
            long bytes,
            String lastUsed,
            int marketDemand,
            int aiThreat
    ) {}

    public record DominantSkill(String skill, int strength, int repoCount, int marketDemand) {}
    public record RecessiveSkill(String skill, int strength, String lastUsed, String activationPotential) {}

    public record SkillMutation(
            String name,
            String description,
            int rarity,
            String salaryImpact,
            List<String> careerPaths
    ) {}

    public record CodeVelocity(
            int totalCommits,
            double commitsPerWeek,
            int activeRepos,
            String velocityLevel,
            int percentile
    ) {}

    public record CommitPatterns(int peakHour, String mostActiveDay, List<Integer> weeklyActivity) {}

    public record CareerTrajectory(
            String type,
            List<String> growingSkills,
            List<String> atRiskSkills,
            String recommendation,
            int confidence,
            int yearsToSenior
    ) {}

    public record ExtinctionRisk(
            String skill,
            int aiThreat,
            int marketDemand,
            String reason,
            String survivalStrategy
    ) {}
}
