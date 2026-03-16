package ee.kerrete.ainterview.arena.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature_usage")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class FeatureUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "feature", nullable = false, length = 50)
    private String feature;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;
}
