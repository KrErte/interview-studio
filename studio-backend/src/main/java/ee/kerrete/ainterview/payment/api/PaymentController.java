package ee.kerrete.ainterview.payment.api;

import ee.kerrete.ainterview.payment.dto.CheckoutRequest;
import ee.kerrete.ainterview.payment.dto.CheckoutResponse;
import ee.kerrete.ainterview.payment.dto.TierResponse;
import ee.kerrete.ainterview.payment.service.PaymentService;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public CheckoutResponse createCheckout(
        @AuthenticationPrincipal AuthenticatedUser user,
        @Valid @RequestBody CheckoutRequest request
    ) {
        return paymentService.createCheckout(user.id(), request);
    }

    @PostMapping("/webhook")
    public void handleWebhook(
        @RequestBody String payload,
        @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader
    ) {
        paymentService.handleWebhook(payload, sigHeader);
    }

    @GetMapping("/tier")
    @PreAuthorize("isAuthenticated()")
    public TierResponse getCurrentTier(@AuthenticationPrincipal AuthenticatedUser user) {
        return paymentService.getUserTier(user.id());
    }

    @PostMapping("/portal")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> createPortalSession(@AuthenticationPrincipal AuthenticatedUser user) {
        String portalUrl = paymentService.createPortalSession(user.id());
        return Map.of("portalUrl", portalUrl);
    }
}
