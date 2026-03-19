package ee.kerrete.ainterview.payment.api;

import ee.kerrete.ainterview.payment.dto.PricingTier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    @GetMapping
    public List<PricingTier> getPricing() {
        return List.of(
            new PricingTier(
                "FREE", "Free", 0, "EUR",
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
                "STARTER", "Starter", 7.99, "EUR",
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
                79.90, 6.66, "MOST POPULAR"
            ),
            new PricingTier(
                "ARENA_PRO", "Pro", 15.99, "EUR",
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
                159.90, 13.33, "BEST VALUE"
            )
        );
    }
}
