package ee.kerrete.ainterview.career.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_profile_id", nullable = false)
    private Long skillProfileId;

    private String headline;

    @Column(name = "role_family")
    private String roleFamily;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private MarketplaceVisibility visibility;

    @Column(name = "score")
    private Double score;

    @Column(name = "overlap_percent")
    private Double overlapPercent;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (visibility == null) visibility = MarketplaceVisibility.LIMITED;
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

