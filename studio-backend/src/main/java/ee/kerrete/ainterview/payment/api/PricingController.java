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
                "FREE", "Free", 0, "USD",
                List.of(
                    "Risk score + 3 blockers",
                    "Teaser action plan",
                    "Job X-Ray (3x/month)",
                    "Basic assessment"
                ),
                false, false, false, null
            ),
            new PricingTier(
                "ARENA_PRO", "Arena Pro", 10, "USD",
                List.of(
                    "Everything in Free",
                    "All Arena tools unlocked",
                    "Interview Simulator (AI-powered)",
                    "Salary Negotiation Coach",
                    "CV/LinkedIn Optimizer",
                    "Unlimited Job X-Ray",
                    "Career Roadmap",
                    "Cancel anytime"
                ),
                false, true, true, "month"
            )
        );
    }
}
