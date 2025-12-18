package ee.kerrete.ainterview.config;

import lombok.extern.slf4j.Slf4j;
import ee.kerrete.ainterview.config.BadRequestException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for non-auth related exceptions.
 * Auth exceptions are handled by AuthExceptionHandler.
 */
@RestControllerAdvice
@Order(0)  // Lower precedence than AuthExceptionHandler
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(BadRequestException ex,
                                                                HttpServletRequest request) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errorBody("BAD_REQUEST", ex.getMessage(), request));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                                  HttpServletRequest request) {
        String expected = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "value";
        String message = "Invalid parameter '" + ex.getName() + "'. Expected " + expected + ".";
        log.warn("Type mismatch: {}", message);
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errorBody("BAD_REQUEST", message, request));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex,
                                                                             HttpServletRequest request) {
        HttpStatusCode status = ex.getStatusCode();
        String message = ex.getReason();

        log.warn("ResponseStatusException: status={}, reason={}", status, ex.getReason());

        // Provide fallback messages for common status codes
        if (message == null || message.isBlank()) {
            message = switch (status.value()) {
                case 401 -> "Invalid credentials";
                case 403 -> "Access denied";
                case 404 -> "Not found";
                default -> "Unexpected error";
            };
        }

        String error = status instanceof HttpStatus httpStatus ? httpStatus.name() : "ERROR";

        return ResponseEntity
            .status(status)
            .body(errorBody(error, message, request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex,
                                                                HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(fieldError -> fieldError.getDefaultMessage() != null
                ? fieldError.getDefaultMessage()
                : "Invalid value")
            .collect(Collectors.joining("; "));
        log.warn("Validation failed: {}", message);
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errorBody("BAD_REQUEST", message, request));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, String>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
                                                                        HttpServletRequest request,
                                                                        Principal principal) {
        log.warn(
            "Method not allowed: method={}, uri={}, queryString={}, remoteAddr={}, principal={}",
            request.getMethod(),
            request.getRequestURI(),
            request.getQueryString(),
            request.getRemoteAddr(),
            principal != null ? principal.getName() : "none"
        );

        return ResponseEntity
            .status(HttpStatus.METHOD_NOT_ALLOWED)
            .body(errorBody("METHOD_NOT_ALLOWED", ex.getMessage(), request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex,
                                                                       HttpServletRequest request) {
        log.error("Unexpected exception", ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(errorBody("INTERNAL_SERVER_ERROR", "Unexpected error", request));
    }

    private Map<String, String> errorBody(String error, String message, HttpServletRequest request) {
        return Map.of(
            "error", error,
            "message", message,
            "path", request.getRequestURI(),
            "timestamp", OffsetDateTime.now(ZoneOffset.UTC).toString()
        );
    }
}
