package ee.kerrete.ainterview.payment.service;

import ee.kerrete.ainterview.model.SubscriptionStatus;
import ee.kerrete.ainterview.model.UserTier;
import ee.kerrete.ainterview.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionExpiryJob {

    private final AppUserRepository appUserRepository;

    @Scheduled(cron = "0 0 3 * * *") // daily at 03:00
    @Transactional
    public void expireProSubscriptions() {
        var expired = appUserRepository.findExpiredProUsers(LocalDateTime.now());
        for (var user : expired) {
            log.info("Expiring Pro access for user {} (accessUntil={})", user.getId(), user.getSubscriptionEndsAt());
            user.setTier(UserTier.FREE);
            user.setSubscriptionStatus(SubscriptionStatus.EXPIRED);
            appUserRepository.save(user);
        }
        if (!expired.isEmpty()) {
            log.info("Expired {} Pro subscriptions", expired.size());
        }
    }
}
