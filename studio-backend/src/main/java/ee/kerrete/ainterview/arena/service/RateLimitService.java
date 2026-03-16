package ee.kerrete.ainterview.arena.service;

import ee.kerrete.ainterview.arena.model.FeatureUsage;
import ee.kerrete.ainterview.arena.repository.FeatureUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final FeatureUsageRepository featureUsageRepository;

    public boolean canUse(Long userId, String feature, int maxPerMonth) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long count = featureUsageRepository.countByUserIdAndFeatureAndUsedAtAfter(userId, feature, startOfMonth);
        return count < maxPerMonth;
    }

    public long getUsageCount(Long userId, String feature) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        return featureUsageRepository.countByUserIdAndFeatureAndUsedAtAfter(userId, feature, startOfMonth);
    }

    public void recordUsage(Long userId, String feature) {
        FeatureUsage usage = FeatureUsage.builder()
                .userId(userId)
                .feature(feature)
                .usedAt(LocalDateTime.now())
                .build();
        featureUsageRepository.save(usage);
    }
}
