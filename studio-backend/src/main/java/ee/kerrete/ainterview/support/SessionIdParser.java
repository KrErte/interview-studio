package ee.kerrete.ainterview.support;

import ee.kerrete.ainterview.config.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.UUID;

@Component
public class SessionIdParser {

    private final Environment environment;
    private final boolean riskMockEnabled;

    public SessionIdParser(Environment environment,
                           @Value("${risk.mock.enabled:false}") boolean riskMockEnabled) {
        this.environment = environment;
        this.riskMockEnabled = riskMockEnabled;
    }

    public SessionIdentifier parseRequired(String raw) {
        if (!StringUtils.hasText(raw)) {
            throw new BadRequestException("sessionId is required");
        }
        return parseInternal(raw.trim());
    }

    public SessionIdentifier parseOptional(String raw) {
        if (!StringUtils.hasText(raw)) {
            return SessionIdentifier.absent();
        }
        return parseInternal(raw.trim());
    }

    private SessionIdentifier parseInternal(String raw) {
        if (isMock(raw)) {
            if (mockAllowed()) {
                return SessionIdentifier.ofMock(raw);
            }
            throw new BadRequestException("Invalid sessionId. Expected UUID.");
        }
        try {
            return SessionIdentifier.ofUuid(UUID.fromString(raw), raw);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid sessionId. Expected UUID.");
        }
    }

    private boolean isMock(String raw) {
        return raw != null && raw.startsWith("mock-session-");
    }

    private boolean mockAllowed() {
        return riskMockEnabled || Arrays.stream(environment.getActiveProfiles())
            .anyMatch(p -> "dev".equalsIgnoreCase(p));
    }

    public record SessionIdentifier(UUID uuid, boolean mock, boolean present, String raw) {
        public static SessionIdentifier ofUuid(UUID uuid, String raw) {
            return new SessionIdentifier(uuid, false, true, raw);
        }

        public static SessionIdentifier ofMock(String raw) {
            return new SessionIdentifier(null, true, true, raw);
        }

        public static SessionIdentifier absent() {
            return new SessionIdentifier(null, false, false, null);
        }

        public boolean hasUuid() {
            return uuid != null;
        }
    }
}

