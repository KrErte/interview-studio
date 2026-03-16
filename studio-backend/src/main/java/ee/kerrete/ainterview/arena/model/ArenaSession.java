package ee.kerrete.ainterview.arena.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "arena_session")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ArenaSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "tool_type", nullable = false, length = 50)
    private String toolType;

    @Column(name = "session_data", columnDefinition = "TEXT")
    private String sessionData;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
