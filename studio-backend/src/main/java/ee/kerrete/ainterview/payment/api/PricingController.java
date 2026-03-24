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
                "STARTER", "Starter", 7.99, "USD",
                features("starter"),
                false, true, true, "month",
                79.90, 6.66, "MOST POPULAR"
            ),
            new PricingTier(
                "ARENA_PRO", "Pro", 15.99, "USD",
                features("pro"),
                false, false, true, "month",
                159.90, 13.33, "BEST VALUE"
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
                "STARTER", "Starter", 7.49, "EUR",
                features("starter"),
                false, true, true, "month",
                74.90, 6.24, "MOST POPULAR"
            ),
            new PricingTier(
                "ARENA_PRO", "Pro", 14.99, "EUR",
                features("pro"),
                false, false, true, "month",
                149.90, 12.49, "BEST VALUE"
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
                "Everything in Free",
                "Full 30-day roadmap + tasks",
                "Task tracking & progress",
                "Session history",
                "Shareable reports",
                "Progress analytics",
                "Email reminders",
                "Job X-Ray (3x/month)",
                "Cancel anytime"
            );
            case "pro" -> List.of(
                "Everything in Starter",
                "NEW:Interview Simulator (AI)",
                "NEW:Salary Negotiation Coach",
                "NEW:CV/LinkedIn Optimizer",
                "NEW:AI Career Mentor",
                "NEW:Company-Specific Prep",
                "NEW:LinkedIn Summary Generator",
                "NEW:Cover Letter Generator",
                "NEW:Salary Benchmark Dashboard",
                "Interview score tracking",
                "PDF report export",
                "Unlimited Job X-Ray",
                "Priority AI processing",
                "Multiple CV sessions",
                "Cancel anytime"
            );
            default -> List.of();
        };
    }
}
