package ee.kerrete.ainterview.api;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/analytics", "/api/studio/analytics"})
public class AnalyticsController {

    @PostMapping("/event")
    public ResponseEntity<Map<String, String>> trackEvent(@RequestBody(required = false) Map<String, Object> payload) {
        log.debug("Analytics event: {}", payload);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
