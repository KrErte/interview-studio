package ee.kerrete.ainterview.payment.api;

import ee.kerrete.ainterview.payment.dto.PricingTier;
import ee.kerrete.ainterview.payment.service.GeoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    private final GeoService geoService;

    public PricingController(GeoService geoService) {
        this.geoService = geoService;
    }

    @GetMapping
    public List<PricingTier> getPricing(HttpServletRequest request) {
        String ip = getClientIp(request);
        String currency = geoService.getCurrency(ip);

        if ("EUR".equals(currency)) {
            return buildTiers("EUR", 7.49, 74.90, 6.24, 14.99, 149.90, 12.49);
        }
        return buildTiers("USD", 7.99, 79.90, 6.66, 15.99, 159.90, 13.33);
    }

    private List<PricingTier> buildTiers(String currency,
                                          double starterPrice, double starterAnnual, double starterAnnualMonthly,
                                          double proPrice, double proAnnual, double proAnnualMonthly) {
        return List.of(
            new PricingTier(
                "FREE", "Free", 0, currency,
                List.of(
                    "Risk assessment + blockers",
                    "Teaser plan (first 3 days)",
                    "Job X-Ray (3x/month)",
                    "Basic assessment",
                    "No credit card needed"
                ),
                false, false, false, null,
                null, null, null
            ),
            new PricingTier(
                "STARTER", "Starter", starterPrice, currency,
                List.of(
                    "Everything in Free",
                    "Full 30-day roadmap + tasks",
                    "Task tracking & progress",
                    "Session history",
                    "Shareable reports",
                    "Progress analytics",
                    "Email reminders",
                    "Job X-Ray (3x/month)",
                    "Cancel anytime"
                ),
                false, true, true, "month",
                starterAnnual, starterAnnualMonthly, "MOST POPULAR"
            ),
            new PricingTier(
                "ARENA_PRO", "Pro", proPrice, currency,
                List.of(
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
                ),
                false, false, true, "month",
                proAnnual, proAnnualMonthly, "BEST VALUE"
            )
        );
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
}
