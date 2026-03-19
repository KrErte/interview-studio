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
                    "Basic assessment"
                ),
                false, false, false, null,
                null, null, null
            ),
            new PricingTier(
                "STARTER", "Starter", 7, "EUR",
                List.of(
                    "Everything in Free",
                    "Full 30-day roadmap + tasks",
                    "Task tracking & progress",
                    "Session history",
                    "Shareable reports",
                    "Job X-Ray (3x/month)",
                    "Cancel anytime"
                ),
                false, true, true, "month",
                58, 4.83, "MOST POPULAR"
            ),
            new PricingTier(
                "ARENA_PRO", "Pro", 15, "EUR",
                List.of(
                    "Everything in Starter",
                    "Interview Simulator (AI)",
                    "Salary Negotiation Coach",
                    "CV/LinkedIn Optimizer",
                    "Priority AI processing",
                    "Unlimited Job X-Ray",
                    "Cancel anytime"
                ),
                false, false, true, "month",
                150, 12.50, "BEST VALUE"
            )
        );
    }
}
