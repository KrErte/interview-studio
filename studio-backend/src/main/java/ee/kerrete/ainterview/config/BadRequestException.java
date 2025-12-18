package ee.kerrete.ainterview.config;

/**
 * Simple runtime exception to signal 400-level client errors without
 * triggering generic 500 handlers.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}

