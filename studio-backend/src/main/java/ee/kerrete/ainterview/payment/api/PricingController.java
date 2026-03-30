package ee.kerrete.ainterview.payment.api;

import ee.kerrete.ainterview.payment.dto.PricingTier;
import ee.kerrete.ainterview.payment.service.GeoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    private static final Logger log = LoggerFactory.getLogger(PricingController.class);

    private final GeoService geoService;

    public PricingController(GeoService geoService) {
        this.geoService = geoService;
    }

    @GetMapping
    public List<PricingTier> getPricing(HttpServletRequest request) {
        String ip = getClientIp(request);
        String currency = geoService.getCurrencyForIp(ip);
        log.info("Pricing request: ip={}, xff={}, realIp={}, remoteAddr={}, currency={}",
                ip,
                request.getHeader("X-Forwarded-For"),
                request.getHeader("X-Real-IP"),
                request.getRemoteAddr(),
                currency);

        if ("EUR".equals(currency)) {
            return eurPricing();
        }
        return usdPricing();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }
        return request.getRemoteAddr();
    }

    private List<PricingTier> usdPricing() {
        return List.of(
            new PricingTier(
                "FREE", "Free", 0, "USD",
                features("free"),
                false, false, false, null,
                null, null, null
            ),
            new PricingTier(
                "STARTER", "Starter", 9, "USD",
                features("starter"),
                false, false, false, null,
                null, null, "ONE-TIME PAYMENT"
            ),
            new PricingTier(
                "ARENA_PRO", "Pro", 19, "USD",
                features("pro"),
                false, true, true, "year",
                null, null, "BEST VALUE"
            )
        );
    }

    private List<PricingTier> eurPricing() {
        return List.of(
            new PricingTier(
                "FREE", "Free", 0, "EUR",
                features("free"),
                false, false, false, null,
                null, null, null
            ),
            new PricingTier(
                "STARTER", "Starter", 9, "EUR",
                features("starter"),
                false, false, false, null,
                null, null, "ONE-TIME PAYMENT"
            ),
            new PricingTier(
                "ARENA_PRO", "Pro", 19, "EUR",
                features("pro"),
                false, true, true, "year",
                null, null, "BEST VALUE"
            )
        );
    }

    private List<String> features(String tier) {
        return switch (tier) {
            case "free" -> List.of(
                "Risk assessment + blockers",
                "Teaser plan (first 3 days)",
                "Job X-Ray (3x/month)",
                "Basic assessment",
                "No credit card needed"
            );
            case "starter" -> List.of(
                "Full report + 30-day action plan",
                "CV rewrite suggestions",
                "Shareable report link",
                "Roles to avoid warning",
                "Career pivot analysis",
                "One-time purchase, yours forever"
            );
            case "pro" -> List.of(
                "Full report + 30-day action plan",
                "AI interview simulator (5 questions)",
                "Quarterly risk score updates",
                "CV rewrite suggestions",
                "Shareable report link",
                "12 months access"
            );
            default -> List.of();
        };
    }
}
