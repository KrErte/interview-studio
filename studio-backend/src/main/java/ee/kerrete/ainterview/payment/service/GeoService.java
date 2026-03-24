package ee.kerrete.ainterview.payment.service;

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

    private static final Set<String> EUR_COUNTRIES = Set.of(
        // Eurozone
        "AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT",
        "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES", "HR",
        // Other European
        "BG", "RO", "PL", "CZ", "HU", "SE", "DK", "NO", "CH", "GB",
        "IS", "AL", "BA", "ME", "MK", "RS", "XK", "MD", "UA", "BY"
    );

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 3600_000; // 1 hour

    public String getCurrencyForIp(String ip) {
        if (ip == null || ip.isBlank() || "127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip)) {
            return "USD";
        }

        // Check cache
        CacheEntry cached = cache.get(ip);
        if (cached != null && System.currentTimeMillis() - cached.timestamp < CACHE_TTL_MS) {
            return cached.currency;
        }

        try {
            // ip-api.com free tier uses HTTP only
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://ip-api.com/json/" + ip + "?fields=countryCode"))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body();

            // Simple JSON parse for {"countryCode":"XX"}
            String countryCode = extractCountryCode(body);
            String currency = EUR_COUNTRIES.contains(countryCode) ? "EUR" : "USD";

            cache.put(ip, new CacheEntry(currency, System.currentTimeMillis()));
            return currency;
        } catch (Exception e) {
            log.warn("GeoIP lookup failed for {}: {}", ip, e.getMessage());
            return "USD";
        }
    }

    private String extractCountryCode(String json) {
        int idx = json.indexOf("\"countryCode\"");
        if (idx < 0) return "";
        int colon = json.indexOf(':', idx);
        int quote1 = json.indexOf('"', colon + 1);
        int quote2 = json.indexOf('"', quote1 + 1);
        if (quote1 < 0 || quote2 < 0) return "";
        return json.substring(quote1 + 1, quote2);
    }

    private record CacheEntry(String currency, long timestamp) {}
}
