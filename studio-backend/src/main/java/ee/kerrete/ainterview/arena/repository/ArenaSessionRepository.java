package ee.kerrete.ainterview.arena.repository;

import ee.kerrete.ainterview.arena.model.ArenaSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArenaSessionRepository extends JpaRepository<ArenaSession, Long> {
    List<ArenaSession> findByUserIdAndToolTypeOrderByCreatedAtDesc(Long userId, String toolType);
}
