package ee.kerrete.ainterview.risk.service;

import ee.kerrete.ainterview.risk.api.RiskController;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Lightweight mock responses for risk endpoints in dev/mock mode.
 * Keeps DB untouched while providing deterministic payloads.
 */
@Service
public class MockRiskService {

    public RiskController.RiskSummaryResponse summary(String sessionId) {
        return new RiskController.RiskSummaryResponse(
            25,
            "LOW",
            "Mock risk snapshot",
            0.42,
            List.of("mock_mode", sessionId == null ? "unknown_session" : sessionId)
        );
    }
}

