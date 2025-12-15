package ee.kerrete.ainterview.pivot.api;

import ee.kerrete.ainterview.pivot.dto.ComputeRoleMatchesRequest;
import ee.kerrete.ainterview.pivot.dto.ComputeRoleMatchesResponse;
import ee.kerrete.ainterview.pivot.dto.PivotRoleMatchDto;
import ee.kerrete.ainterview.pivot.service.PivotRoleMatchService;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import ee.kerrete.ainterview.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/studio/pivot/role-matches", "/api/pivot/role-matches"})
@Validated
@RequiredArgsConstructor
public class RoleMatchController {

    private final PivotRoleMatchService roleMatchService;

    @PostMapping("/compute")
    @PreAuthorize("hasRole('JOBSEEKER')")
    public ComputeRoleMatchesResponse compute(@Valid @RequestBody ComputeRoleMatchesRequest request,
                                              @CurrentUser AuthenticatedUser user) {
        return roleMatchService.compute(user.id(), request);
    }

    @GetMapping
    @PreAuthorize("hasRole('JOBSEEKER')")
    public List<PivotRoleMatchDto> list(@CurrentUser AuthenticatedUser user) {
        return roleMatchService.getForUser(user.id());
    }
}

