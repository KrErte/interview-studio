package ee.kerrete.ainterview.auth.util;

import ee.kerrete.ainterview.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;

import java.util.Map;
import java.util.Optional;

public final class SecurityUtils {

    private static final String ANONYMOUS = "anonymous@local";

    private SecurityUtils() {
    }

    /**
     * Resolve current user's email from SecurityContext if available.
     * Falls back to provided requestEmail when non-blank, otherwise returns anonymous placeholder.
     */
    public static String resolveEmailOrAnonymous(String requestEmail) {
        Optional<String> fromContext = getEmailFromSecurityContext();
        if (fromContext.isPresent()) {
            return fromContext.get();
        }
        if (StringUtils.hasText(requestEmail)) {
            return requestEmail.trim();
        }
        return ANONYMOUS;
    }

    /**
     * Resolve current user's email from SecurityContext or anonymous placeholder.
     */
    public static String resolveEmailOrAnonymous() {
        return resolveEmailOrAnonymous(null);
    }

    /**
     * Try to resolve the current user's email from the security context.
     */
    public static Optional<String> getEmailFromSecurityContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthenticatedUser user && StringUtils.hasText(user.email())) {
            return Optional.of(user.email());
        }
        if (principal instanceof UserDetails details && StringUtils.hasText(details.getUsername())) {
            return Optional.of(details.getUsername());
        }
        // Try to read from generic claims map (e.g. JWT) without hard dependency
        if (principal instanceof Map<?, ?> claimsMap) {
            Object emailClaim = claimsMap.get("email");
            if (emailClaim instanceof String s && StringUtils.hasText(s)) {
                return Optional.of(s);
            }
        }
        if (principal instanceof String s && StringUtils.hasText(s) && !"anonymousUser".equalsIgnoreCase(s)) {
            return Optional.of(s);
        }
        String name = authentication.getName();
        if (StringUtils.hasText(name) && !"anonymousUser".equalsIgnoreCase(name)) {
            return Optional.of(name);
        }
        return Optional.empty();
    }
}

