package ee.kerrete.ainterview.auth.api;

import ee.kerrete.ainterview.auth.dto.request.LoginRequest;
import ee.kerrete.ainterview.auth.dto.request.RefreshRequest;
import ee.kerrete.ainterview.auth.dto.request.RegisterRequest;
import ee.kerrete.ainterview.auth.dto.response.AuthResponse;
import ee.kerrete.ainterview.auth.service.AuthService;
import ee.kerrete.ainterview.auth.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for authentication endpoints.
 * All endpoints are public (no authentication required).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user.
     *
     * @param request Registration details (email, password, fullName, optional role)
     * @return Authentication response with tokens
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        log.debug("Registration request for email: {}", request.email());
        return authService.register(request);
    }

    /**
     * Login with email and password.
     *
     * @param request Login credentials
     * @return Authentication response with tokens
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        log.debug("Login request for email: {}", request.email());
        return authService.login(request);
    }

    /**
     * Alias for login to support clients calling /authenticate.
     */
    @PostMapping("/authenticate")
    public AuthResponse authenticate(@Valid @RequestBody LoginRequest request) {
        return login(request);
    }

    /**
     * Refresh access token using a valid refresh token.
     *
     * @param request Refresh token
     * @return New authentication response with fresh tokens
     */
    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        log.debug("Token refresh request");
        return authService.refreshToken(request.refreshToken());
    }

    /**
     * Lightweight protected endpoint to return current user info.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public MeResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = SecurityUtils.getEmailFromSecurityContext().orElse(authentication.getName());
        List<String> roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
        return new MeResponse(username, roles);
    }

    public record MeResponse(String username, List<String> roles) {}
}
