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
                    "Job Analyzer 1x/day"
                ),
                false, false, false, null
            ),
            new PricingTier(
                "ESSENTIALS", "Essentials", 7, "USD",
                List.of(
                    "Full assessment (all tabs)",
                    "Action plan",
                    "Skill vulnerability matrix",
                    "Market pulse signals"
                ),
                false, false, false, null
            ),
            new PricingTier(
                "PROFESSIONAL", "Professional", 19, "USD",
                List.of(
                    "Everything in Essentials",
                    "Arena tools (Interview, Negotiation, Truth, Stress Test)",
                    "Career Roadmap",
                    "Unlimited Job Analyzer"
                ),
                false, true, false, null
            ),
            new PricingTier(
                "LIFETIME", "Lifetime", 49, "USD",
                List.of(
                    "Everything in Professional",
                    "All future features forever",
                    "Priority support",
                    "Early access to new tools"
                ),
                false, false, false, null
            ),
            new PricingTier(
                "ARENA_PRO", "Arena Pro", 10, "USD",
                List.of(
                    "Everything in Professional",
                    "Cancel anytime",
                    "Monthly billing",
                    "All Arena tools unlocked"
                ),
                false, false, true, "month"
            )
        );
    }
}
