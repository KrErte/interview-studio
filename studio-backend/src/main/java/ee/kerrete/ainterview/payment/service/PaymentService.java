package ee.kerrete.ainterview.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.*;
import com.stripe.model.billingportal.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import ee.kerrete.ainterview.model.AppUser;
import ee.kerrete.ainterview.model.SubscriptionStatus;
import ee.kerrete.ainterview.model.UserTier;
import ee.kerrete.ainterview.payment.config.StripeProperties;
import ee.kerrete.ainterview.payment.dto.CheckoutRequest;
import ee.kerrete.ainterview.payment.dto.CheckoutResponse;
import ee.kerrete.ainterview.payment.dto.TierResponse;
import ee.kerrete.ainterview.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final StripeProperties stripeProperties;
    private final AppUserRepository appUserRepository;
    private final ObjectMapper objectMapper;

    public CheckoutResponse createCheckout(Long userId, CheckoutRequest request) {
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.hasActiveSubscription()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already has an active subscription");
        }

        try {
            // Ensure user has a Stripe customer ID
            String customerId = getOrCreateStripeCustomer(user);

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(customerId)
                .setSuccessUrl(request.successUrl() + "&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(request.cancelUrl())
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setPrice(stripeProperties.arenaProPriceId())
                        .setQuantity(1L)
                        .build()
                )
                .putMetadata("user_id", String.valueOf(user.getId()))
                .build();

            com.stripe.model.checkout.Session session =
                com.stripe.model.checkout.Session.create(params);

            return new CheckoutResponse(session.getUrl());
        } catch (Exception e) {
            log.error("Failed to create Stripe checkout session", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create checkout");
        }
    }

    public String createPortalSession(Long userId) {
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getStripeCustomerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Stripe customer found");
        }

        try {
            com.stripe.param.billingportal.SessionCreateParams params =
                com.stripe.param.billingportal.SessionCreateParams.builder()
                    .setCustomer(user.getStripeCustomerId())
                    .setReturnUrl(System.getProperty("app.frontend.url", "http://localhost:4200") + "/pricing")
                    .build();

            Session portalSession = Session.create(params);
            return portalSession.getUrl();
        } catch (Exception e) {
            log.error("Failed to create Stripe portal session", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create portal session");
        }
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeProperties.webhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid signature");
        } catch (Exception e) {
            log.error("Failed to parse Stripe webhook", e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to parse webhook");
        }

        String eventType = event.getType();
        log.info("Received Stripe webhook: {}", eventType);

        switch (eventType) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(event);
            case "invoice.payment_failed" -> handlePaymentFailed(event);
            default -> log.info("Ignoring unhandled Stripe event: {}", eventType);
        }
    }

    public TierResponse getUserTier(Long userId) {
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new TierResponse(
            user.getEffectiveTier().name(),
            user.getTierPurchasedAt() != null ? user.getTierPurchasedAt().toString() : null,
            user.hasActiveSubscription(),
            user.getSubscriptionStatus() != null ? user.getSubscriptionStatus().name() : null,
            user.getSubscriptionEndsAt() != null ? user.getSubscriptionEndsAt().toString() : null
        );
    }

    private String getOrCreateStripeCustomer(AppUser user) throws Exception {
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        CustomerCreateParams params = CustomerCreateParams.builder()
            .setEmail(user.getEmail())
            .setName(user.getFullName())
            .putMetadata("user_id", String.valueOf(user.getId()))
            .build();

        Customer customer = Customer.create(params);
        user.setStripeCustomerId(customer.getId());
        appUserRepository.save(user);

        return customer.getId();
    }

    private void handleCheckoutCompleted(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isEmpty()) {
            log.warn("checkout.session.completed: no data object");
            return;
        }

        com.stripe.model.checkout.Session session =
            (com.stripe.model.checkout.Session) deserializer.getObject().get();

        String subscriptionId = session.getSubscription();
        Map<String, String> metadata = session.getMetadata();
        long userId = Long.parseLong(metadata.getOrDefault("user_id", "0"));

        if (userId == 0) {
            log.warn("checkout.session.completed: missing user_id in metadata");
            return;
        }

        appUserRepository.findById(userId).ifPresent(user -> {
            user.setTier(UserTier.ARENA_PRO);
            user.setTierPurchasedAt(LocalDateTime.now());
            user.setSubscriptionId(subscriptionId);
            user.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
            user.setSubscriptionCreatedAt(LocalDateTime.now());

            if (user.getStripeCustomerId() == null && session.getCustomer() != null) {
                user.setStripeCustomerId(session.getCustomer());
            }

            appUserRepository.save(user);
            log.info("User {} upgraded to ARENA_PRO via Stripe checkout", userId);
        });
    }

    private void handleSubscriptionUpdated(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isEmpty()) return;

        Subscription subscription = (Subscription) deserializer.getObject().get();
        String subscriptionId = subscription.getId();
        String status = subscription.getStatus();

        appUserRepository.findBySubscriptionId(subscriptionId).ifPresent(user -> {
            user.setSubscriptionStatus(mapStripeStatus(status));

            if (subscription.getCurrentPeriodEnd() != null) {
                user.setSubscriptionEndsAt(
                    LocalDateTime.ofInstant(
                        Instant.ofEpochSecond(subscription.getCurrentPeriodEnd()),
                        ZoneOffset.UTC
                    )
                );
            }

            // If subscription is no longer active, downgrade
            if ("canceled".equals(status) || "unpaid".equals(status)) {
                user.setTier(UserTier.FREE);
            }

            appUserRepository.save(user);
            log.info("Subscription {} updated: status={}", subscriptionId, status);
        });
    }

    private void handleSubscriptionDeleted(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isEmpty()) return;

        Subscription subscription = (Subscription) deserializer.getObject().get();
        String subscriptionId = subscription.getId();

        appUserRepository.findBySubscriptionId(subscriptionId).ifPresent(user -> {
            user.setSubscriptionStatus(SubscriptionStatus.EXPIRED);
            user.setTier(UserTier.FREE);
            appUserRepository.save(user);
            log.info("Subscription {} deleted, user {} downgraded to FREE", subscriptionId, user.getId());
        });
    }

    private void handlePaymentFailed(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isEmpty()) return;

        Invoice invoice = (Invoice) deserializer.getObject().get();
        String subscriptionId = invoice.getSubscription();

        if (subscriptionId != null) {
            appUserRepository.findBySubscriptionId(subscriptionId).ifPresent(user -> {
                user.setSubscriptionStatus(SubscriptionStatus.PAST_DUE);
                appUserRepository.save(user);
                log.warn("Payment failed for subscription {}, user {}", subscriptionId, user.getId());
            });
        }
    }

    private SubscriptionStatus mapStripeStatus(String status) {
        return switch (status) {
            case "active", "trialing" -> SubscriptionStatus.ACTIVE;
            case "canceled" -> SubscriptionStatus.CANCELLED;
            case "unpaid", "incomplete_expired" -> SubscriptionStatus.EXPIRED;
            case "past_due", "incomplete" -> SubscriptionStatus.PAST_DUE;
            default -> SubscriptionStatus.ACTIVE;
        };
    }
}
