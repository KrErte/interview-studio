package ee.kerrete.ainterview.career.repository;

import ee.kerrete.ainterview.career.model.RoleProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleProfileRepository extends JpaRepository<RoleProfile, Long> {
    Optional<RoleProfile> findByRoleKey(String roleKey);
    List<RoleProfile> findByRoleFamily(String roleFamily);
}

