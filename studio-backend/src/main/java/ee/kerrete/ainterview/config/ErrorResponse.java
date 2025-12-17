package ee.kerrete.ainterview.config;

/**
 * Minimal error response payload for HTTP error handling.
 */
public record ErrorResponse(
    String error,
    String message,
    String path,
    String method,
    String timestamp
) {
}

