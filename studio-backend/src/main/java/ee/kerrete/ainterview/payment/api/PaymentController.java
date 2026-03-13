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
        @RequestHeader(value = "X-Signature", required = false) String signature
    ) {
        paymentService.handleWebhook(payload, signature);
    }

    @GetMapping("/tier")
    @PreAuthorize("isAuthenticated()")
    public TierResponse getCurrentTier(@AuthenticationPrincipal AuthenticatedUser user) {
        return paymentService.getUserTier(user.id());
    }
}
