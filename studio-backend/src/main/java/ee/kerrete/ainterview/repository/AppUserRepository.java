package ee.kerrete.ainterview.repository;

import ee.kerrete.ainterview.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByEmailIgnoreCase(String email);
    Optional<AppUser> findBySubscriptionId(String subscriptionId);
    Optional<AppUser> findByResetToken(String resetToken);

    @Query("SELECT u FROM AppUser u WHERE u.tier = 'ARENA_PRO' AND u.subscriptionStatus = 'ACTIVE' AND u.subscriptionEndsAt IS NOT NULL AND u.subscriptionEndsAt < :now")
    List<AppUser> findExpiredProUsers(@Param("now") LocalDateTime now);
}
