package ee.kerrete.ainterview.pivot.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Fetches real-time technology trends from GitHub API.
 * Tracks: AI/ML repo growth, language popularity shifts, emerging frameworks.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubTrendsService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Get trending AI/ML repositories - indicates where AI capability is advancing
     */
    @Cacheable(value = "github-ai-trends", key = "'ai-repos'")
    public List<Map<String, Object>> getTrendingAIRepos() {
        try {
            String since = LocalDate.now().minusDays(30).format(DateTimeFormatter.ISO_DATE);
            String url = "https://api.github.com/search/repositories?q=ai+OR+llm+OR+machine-learning+created:>"
                + since + "&sort=stars&order=desc&per_page=20";

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.get("items");

            List<Map<String, Object>> repos = new ArrayList<>();
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    Map<String, Object> repo = new HashMap<>();
                    repo.put("name", item.get("full_name").asText());
                    repo.put("stars", item.get("stargazers_count").asInt());
                    repo.put("description", item.has("description") && !item.get("description").isNull()
                        ? item.get("description").asText() : "");
                    repo.put("language", item.has("language") && !item.get("language").isNull()
                        ? item.get("language").asText() : "Unknown");
                    repo.put("url", item.get("html_url").asText());
                    repos.add(repo);
                }
            }
            return repos;
        } catch (Exception e) {
            log.warn("Failed to fetch GitHub AI trends: {}", e.getMessage());
            return getDefaultAITrends();
        }
    }

    /**
     * Get language popularity trends - indicates skill demand shifts
     */
    @Cacheable(value = "github-language-trends", key = "'languages'")
    public Map<String, LanguageTrend> getLanguageTrends() {
        // GitHub doesn't have a direct language trends API, so we use repo search
        // to estimate language momentum
        Map<String, LanguageTrend> trends = new LinkedHashMap<>();

        String[] languages = {"Python", "TypeScript", "Rust", "Go", "JavaScript", "Java", "C++", "Kotlin"};

        for (String lang : languages) {
            try {
                String since = LocalDate.now().minusDays(90).format(DateTimeFormatter.ISO_DATE);
                String url = "https://api.github.com/search/repositories?q=language:" + lang
                    + "+created:>" + since + "&per_page=1";

                String response = restTemplate.getForObject(url, String.class);
                JsonNode root = objectMapper.readTree(response);
                int totalCount = root.get("total_count").asInt();

                // Compare with 90 days before that
                String oldSince = LocalDate.now().minusDays(180).format(DateTimeFormatter.ISO_DATE);
                String oldUntil = LocalDate.now().minusDays(90).format(DateTimeFormatter.ISO_DATE);
                String oldUrl = "https://api.github.com/search/repositories?q=language:" + lang
                    + "+created:" + oldSince + ".." + oldUntil + "&per_page=1";

                String oldResponse = restTemplate.getForObject(oldUrl, String.class);
                JsonNode oldRoot = objectMapper.readTree(oldResponse);
                int oldCount = oldRoot.get("total_count").asInt();

                double growth = oldCount > 0 ? ((double)(totalCount - oldCount) / oldCount) * 100 : 0;

                trends.put(lang, new LanguageTrend(lang, totalCount, growth,
                    growth > 10 ? "rising" : growth < -10 ? "declining" : "stable"));

                // Rate limit protection
                Thread.sleep(100);
            } catch (Exception e) {
                log.warn("Failed to fetch trends for {}: {}", lang, e.getMessage());
            }
        }

        if (trends.isEmpty()) {
            return getDefaultLanguageTrends();
        }
        return trends;
    }

    /**
     * Get AI code assistant adoption metrics - direct threat indicator
     */
    @Cacheable(value = "github-ai-tools", key = "'ai-coding-tools'")
    public List<AIToolMetric> getAICodingToolMetrics() {
        List<AIToolMetric> metrics = new ArrayList<>();

        // Track major AI coding tools by their repo/org activity
        Map<String, String> aiTools = Map.of(
            "github/copilot-docs", "GitHub Copilot",
            "Pythagora-io/gpt-pilot", "GPT Pilot",
            "AntonOsika/gpt-engineer", "GPT Engineer",
            "Significant-Gravitas/AutoGPT", "AutoGPT",
            "smol-ai/developer", "Smol Developer"
        );

        for (Map.Entry<String, String> entry : aiTools.entrySet()) {
            try {
                String url = "https://api.github.com/repos/" + entry.getKey();
                String response = restTemplate.getForObject(url, String.class);
                JsonNode repo = objectMapper.readTree(response);

                metrics.add(new AIToolMetric(
                    entry.getValue(),
                    repo.get("stargazers_count").asInt(),
                    repo.get("forks_count").asInt(),
                    repo.has("subscribers_count") ? repo.get("subscribers_count").asInt() : 0
                ));

                Thread.sleep(100);
            } catch (Exception e) {
                log.warn("Failed to fetch metrics for {}: {}", entry.getKey(), e.getMessage());
            }
        }

        if (metrics.isEmpty()) {
            return getDefaultAIToolMetrics();
        }
        return metrics;
    }

    // Fallback data when API is unavailable
    private List<Map<String, Object>> getDefaultAITrends() {
        List<Map<String, Object>> defaults = new ArrayList<>();
        defaults.add(Map.of("name", "openai/openai-python", "stars", 15000,
            "description", "OpenAI Python API library", "language", "Python"));
        defaults.add(Map.of("name", "langchain-ai/langchain", "stars", 75000,
            "description", "Building applications with LLMs", "language", "Python"));
        defaults.add(Map.of("name", "anthropics/anthropic-sdk-python", "stars", 5000,
            "description", "Anthropic Python SDK", "language", "Python"));
        return defaults;
    }

    private Map<String, LanguageTrend> getDefaultLanguageTrends() {
        Map<String, LanguageTrend> defaults = new LinkedHashMap<>();
        defaults.put("Python", new LanguageTrend("Python", 2500000, 15.5, "rising"));
        defaults.put("TypeScript", new LanguageTrend("TypeScript", 1800000, 22.3, "rising"));
        defaults.put("Rust", new LanguageTrend("Rust", 450000, 35.2, "rising"));
        defaults.put("Go", new LanguageTrend("Go", 680000, 8.5, "stable"));
        defaults.put("JavaScript", new LanguageTrend("JavaScript", 3200000, -2.1, "stable"));
        defaults.put("Java", new LanguageTrend("Java", 1500000, -5.3, "declining"));
        return defaults;
    }

    private List<AIToolMetric> getDefaultAIToolMetrics() {
        return List.of(
            new AIToolMetric("GitHub Copilot", 12500, 890, 450),
            new AIToolMetric("GPT Engineer", 48000, 4200, 320),
            new AIToolMetric("AutoGPT", 158000, 32000, 1200)
        );
    }

    public record LanguageTrend(String language, int repoCount, double growthPercent, String trend) {}
    public record AIToolMetric(String name, int stars, int forks, int watchers) {}
}
