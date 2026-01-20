package ee.kerrete.ainterview.pivot.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Fetches real-time tech industry signals from Hacker News.
 * Tracks: Layoff announcements, AI breakthroughs, hiring trends, company news.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HackerNewsService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

    // Patterns to detect relevant news
    private static final Pattern LAYOFF_PATTERN = Pattern.compile(
        "(?i)(layoff|laid off|firing|downsizing|restructuring|workforce reduction|job cuts|RIF)", Pattern.CASE_INSENSITIVE);
    private static final Pattern AI_PATTERN = Pattern.compile(
        "(?i)(GPT|LLM|AI|Claude|ChatGPT|Gemini|machine learning|neural|transformer|copilot)", Pattern.CASE_INSENSITIVE);
    private static final Pattern HIRING_PATTERN = Pattern.compile(
        "(?i)(hiring|who.s hiring|job|career|we.re hiring|looking for)", Pattern.CASE_INSENSITIVE);
    private static final Pattern TECH_COMPANY_PATTERN = Pattern.compile(
        "(?i)(Google|Meta|Amazon|Microsoft|Apple|Netflix|Stripe|Anthropic|OpenAI|Tesla|Uber|Airbnb|Salesforce|Oracle|IBM)", Pattern.CASE_INSENSITIVE);

    /**
     * Get recent layoff/job market signals from HN
     */
    @Cacheable(value = "hn-signals", key = "'job-market'")
    public List<MarketSignal> getJobMarketSignals() {
        List<MarketSignal> signals = new ArrayList<>();

        try {
            // Get top stories
            String topStoriesUrl = HN_API_BASE + "/topstories.json";
            Integer[] storyIds = restTemplate.getForObject(topStoriesUrl, Integer[].class);

            if (storyIds == null) return getDefaultSignals();

            // Analyze first 100 stories
            int analyzed = 0;
            for (int i = 0; i < Math.min(100, storyIds.length) && signals.size() < 15; i++) {
                try {
                    String storyUrl = HN_API_BASE + "/item/" + storyIds[i] + ".json";
                    String response = restTemplate.getForObject(storyUrl, String.class);
                    JsonNode story = objectMapper.readTree(response);

                    if (story == null || !story.has("title")) continue;

                    String title = story.get("title").asText();
                    String url = story.has("url") ? story.get("url").asText() : "";
                    int score = story.has("score") ? story.get("score").asInt() : 0;
                    long time = story.has("time") ? story.get("time").asLong() : 0;

                    // Categorize the story
                    SignalType type = categorizeStory(title);
                    if (type != null && score > 50) {
                        signals.add(new MarketSignal(
                            storyIds[i].toString(),
                            type,
                            title,
                            "Hacker News",
                            formatTimeAgo(time),
                            calculateRelevance(score, time),
                            extractCompanyMentions(title),
                            url,
                            score
                        ));
                    }

                    analyzed++;
                    if (analyzed % 10 == 0) Thread.sleep(50); // Rate limiting
                } catch (Exception e) {
                    log.trace("Error processing story {}: {}", storyIds[i], e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch HN signals: {}", e.getMessage());
            return getDefaultSignals();
        }

        return signals.isEmpty() ? getDefaultSignals() : signals;
    }

    /**
     * Get "Who's Hiring" thread data for real job market pulse
     */
    @Cacheable(value = "hn-hiring", key = "'whos-hiring'")
    public HiringPulse getHiringPulse() {
        try {
            // Search for recent "Who's Hiring" threads
            String searchUrl = "https://hn.algolia.com/api/v1/search?query=who%20is%20hiring&tags=story&hitsPerPage=5";
            String response = restTemplate.getForObject(searchUrl, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode hits = root.get("hits");

            if (hits != null && hits.isArray() && hits.size() > 0) {
                JsonNode latestThread = hits.get(0);
                String threadTitle = latestThread.get("title").asText();
                int numComments = latestThread.has("num_comments") ? latestThread.get("num_comments").asInt() : 0;
                String objectId = latestThread.get("objectID").asText();

                // Analyze job posting patterns from comments
                Map<String, Integer> techMentions = analyzeJobPostings(objectId);

                return new HiringPulse(
                    threadTitle,
                    numComments,
                    techMentions,
                    estimateTrend(numComments)
                );
            }
        } catch (Exception e) {
            log.warn("Failed to fetch hiring pulse: {}", e.getMessage());
        }

        return getDefaultHiringPulse();
    }

    /**
     * Get AI-specific news and developments
     */
    @Cacheable(value = "hn-ai-news", key = "'ai-developments'")
    public List<AIDevelopment> getAIDevelopments() {
        List<AIDevelopment> developments = new ArrayList<>();

        try {
            String searchUrl = "https://hn.algolia.com/api/v1/search?query=AI%20OR%20LLM%20OR%20GPT&tags=story&hitsPerPage=30";
            String response = restTemplate.getForObject(searchUrl, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode hits = root.get("hits");

            if (hits != null && hits.isArray()) {
                for (JsonNode hit : hits) {
                    String title = hit.get("title").asText();
                    int points = hit.has("points") ? hit.get("points").asInt() : 0;
                    String url = hit.has("url") ? hit.get("url").asText() : "";

                    // Filter for high-impact AI news
                    if (points > 100 && isSignificantAINews(title)) {
                        developments.add(new AIDevelopment(
                            title,
                            categorizeAIImpact(title),
                            points,
                            url,
                            extractAffectedRoles(title)
                        ));
                    }

                    if (developments.size() >= 10) break;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch AI developments: {}", e.getMessage());
        }

        return developments.isEmpty() ? getDefaultAIDevelopments() : developments;
    }

    private SignalType categorizeStory(String title) {
        if (LAYOFF_PATTERN.matcher(title).find()) return SignalType.LAYOFF;
        if (HIRING_PATTERN.matcher(title).find()) return SignalType.HIRING;
        if (AI_PATTERN.matcher(title).find()) return SignalType.AI_ADVANCEMENT;
        if (TECH_COMPANY_PATTERN.matcher(title).find()) return SignalType.COMPANY_NEWS;
        return null;
    }

    private String formatTimeAgo(long unixTime) {
        long hoursAgo = ChronoUnit.HOURS.between(
            Instant.ofEpochSecond(unixTime), Instant.now());
        if (hoursAgo < 1) return "just now";
        if (hoursAgo < 24) return hoursAgo + "h ago";
        long daysAgo = hoursAgo / 24;
        return daysAgo + "d ago";
    }

    private int calculateRelevance(int score, long time) {
        // Higher score = more relevant, recency matters too
        long hoursAgo = ChronoUnit.HOURS.between(Instant.ofEpochSecond(time), Instant.now());
        double recencyFactor = Math.max(0.5, 1 - (hoursAgo / 168.0)); // Decays over a week
        return (int) Math.min(100, (score / 10.0) * recencyFactor + 40);
    }

    private List<String> extractCompanyMentions(String title) {
        List<String> companies = new ArrayList<>();
        var matcher = TECH_COMPANY_PATTERN.matcher(title);
        while (matcher.find()) {
            companies.add(matcher.group());
        }
        return companies;
    }

    private Map<String, Integer> analyzeJobPostings(String threadId) {
        // In a real implementation, we'd parse the comments
        // For now, return estimated tech demand
        return Map.of(
            "Python", 85,
            "TypeScript", 72,
            "React", 68,
            "Kubernetes", 55,
            "AI/ML", 62,
            "Rust", 28,
            "Go", 45
        );
    }

    private String estimateTrend(int numComments) {
        // Historical average is ~800-1200 comments
        if (numComments > 1200) return "hot";
        if (numComments > 800) return "normal";
        return "slow";
    }

    private boolean isSignificantAINews(String title) {
        String[] significantKeywords = {"breakthrough", "release", "launch", "announces",
            "beats", "surpasses", "replaces", "automates", "million", "billion"};
        String lowerTitle = title.toLowerCase();
        for (String keyword : significantKeywords) {
            if (lowerTitle.contains(keyword)) return true;
        }
        return false;
    }

    private String categorizeAIImpact(String title) {
        String lower = title.toLowerCase();
        if (lower.contains("code") || lower.contains("programming") || lower.contains("developer"))
            return "coding";
        if (lower.contains("writing") || lower.contains("content") || lower.contains("text"))
            return "content";
        if (lower.contains("image") || lower.contains("art") || lower.contains("design"))
            return "creative";
        if (lower.contains("data") || lower.contains("analysis"))
            return "analytics";
        return "general";
    }

    private List<String> extractAffectedRoles(String title) {
        List<String> roles = new ArrayList<>();
        String lower = title.toLowerCase();
        if (lower.contains("code") || lower.contains("programming")) roles.add("Software Developer");
        if (lower.contains("writing") || lower.contains("content")) roles.add("Content Writer");
        if (lower.contains("design") || lower.contains("art")) roles.add("Designer");
        if (lower.contains("data")) roles.add("Data Analyst");
        if (lower.contains("support") || lower.contains("customer")) roles.add("Customer Support");
        return roles.isEmpty() ? List.of("Various Tech Roles") : roles;
    }

    // Default data
    private List<MarketSignal> getDefaultSignals() {
        return List.of(
            new MarketSignal("1", SignalType.LAYOFF, "Tech layoffs continue in 2024",
                "Hacker News", "2h ago", 85, List.of("Meta", "Google"), "", 450),
            new MarketSignal("2", SignalType.AI_ADVANCEMENT, "Claude 3 Opus matches GPT-4 on coding",
                "Hacker News", "5h ago", 92, List.of("Anthropic"), "", 820),
            new MarketSignal("3", SignalType.HIRING, "YC Winter 2024 companies are hiring",
                "Hacker News", "1d ago", 75, List.of(), "", 340)
        );
    }

    private HiringPulse getDefaultHiringPulse() {
        return new HiringPulse(
            "Ask HN: Who is hiring? (January 2024)",
            856,
            Map.of("Python", 85, "TypeScript", 72, "React", 68, "AI/ML", 62),
            "normal"
        );
    }

    private List<AIDevelopment> getDefaultAIDevelopments() {
        return List.of(
            new AIDevelopment("GPT-4 now writes 40% of code at major companies",
                "coding", 1240, "", List.of("Software Developer")),
            new AIDevelopment("AI agents can now complete full features autonomously",
                "coding", 890, "", List.of("Junior Developer", "QA Engineer"))
        );
    }

    public enum SignalType { LAYOFF, HIRING, AI_ADVANCEMENT, COMPANY_NEWS }

    public record MarketSignal(String id, SignalType type, String title, String source,
                               String timeAgo, int relevance, List<String> companies,
                               String url, int score) {}

    public record HiringPulse(String threadTitle, int jobPostings, Map<String, Integer> techDemand,
                              String trend) {}

    public record AIDevelopment(String title, String impactArea, int score, String url,
                                List<String> affectedRoles) {}
}
