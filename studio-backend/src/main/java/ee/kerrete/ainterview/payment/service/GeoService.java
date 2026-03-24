package ee.kerrete.ainterview.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeoService {

    private static final Logger log = LoggerFactory.getLogger(GeoService.class);
    private static final long CACHE_TTL_MS = 3_600_000; // 1 hour

    private static final Set<String> EUR_COUNTRIES = Set.of(
        // Eurozone
        "AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT",
        "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES", "HR",
        // Other European (show EUR for familiarity)
        "BG", "RO", "PL", "CZ", "HU", "SE", "DK", "NO", "CH", "GB",
        "IS", "AL", "BA", "ME", "MK", "RS", "UA", "MD", "BY"
    );

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public String getCurrency(String ip) {
        if (ip == null || ip.isBlank() || "127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip)) {
            return "USD";
        }

        CacheEntry cached = cache.get(ip);
        if (cached != null && !cached.isExpired()) {
            return cached.currency;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://ip-api.com/json/" + ip + "?fields=countryCode"))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode node = mapper.readTree(response.body());
            String countryCode = node.has("countryCode") ? node.get("countryCode").asText() : "";

            String currency = EUR_COUNTRIES.contains(countryCode) ? "EUR" : "USD";
            cache.put(ip, new CacheEntry(currency));
            return currency;
        } catch (Exception e) {
            log.warn("GeoIP lookup failed for {}: {}", ip, e.getMessage());
            return "USD";
        }
    }

    private static class CacheEntry {
        final String currency;
        final long createdAt;

        CacheEntry(String currency) {
            this.currency = currency;
            this.createdAt = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - createdAt > CACHE_TTL_MS;
        }
    }
}
