package ee.kerrete.ainterview.pivot.entity;

import ee.kerrete.ainterview.pivot.enums.VisibilityLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pivot_marketplace_profile")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PivotMarketplaceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transition_profile_id", nullable = false, unique = true)
    private TransitionProfile profile;

    @Column(name = "headline")
    private String headline;

    @Column(name = "anonymized_label")
    private String anonymizedLabel;

    @Column(name = "location_preference")
    private String locationPreference;

    @Column(name = "target_rate")
    private BigDecimal targetRate;

    @Column(name = "open_to_interview", nullable = false)
    @Builder.Default
    private boolean openToInterview = true;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_handle")
    private String contactHandle;

    @Column(name = "availability_start")
    private LocalDate availabilityStart;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    @Builder.Default
    private VisibilityLevel visibility = VisibilityLevel.OFF;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}


