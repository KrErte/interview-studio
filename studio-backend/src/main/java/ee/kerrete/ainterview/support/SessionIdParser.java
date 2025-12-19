package ee.kerrete.ainterview.support;

import ee.kerrete.ainterview.config.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Component
public class SessionIdParser {

    public SessionIdParser(@Value("${risk.mock.enabled:false}") boolean riskMockEnabled) {
        // riskMockEnabled kept for backward-compatibility with existing config; currently unused
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
            return SessionIdentifier.mock(raw);
        }
        try {
            return SessionIdentifier.uuid(UUID.fromString(raw), raw);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid sessionId. Expected UUID or mock-session-<digits>.");
        }
    }

    private boolean isMock(String raw) {
        return raw != null && raw.matches("^mock-session-\\d+$");
    }

    public record SessionIdentifier(UUID uuid, boolean mock, boolean present, String raw) {
        static SessionIdentifier uuid(UUID uuid, String raw) {
            return new SessionIdentifier(uuid, false, true, raw);
        }

        static SessionIdentifier mock(String raw) {
            return new SessionIdentifier(null, true, true, raw);
        }

        static SessionIdentifier absent() {
            return new SessionIdentifier(null, false, false, null);
        }

        public boolean hasUuid() {
            return uuid != null;
        }
    }
}

