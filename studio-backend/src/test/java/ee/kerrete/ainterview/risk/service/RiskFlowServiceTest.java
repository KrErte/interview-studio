package ee.kerrete.ainterview.risk.service;

import ee.kerrete.ainterview.risk.dto.RiskFlowNextRequest;
import ee.kerrete.ainterview.risk.dto.RiskFlowStartRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RiskFlowServiceTest {

    private RiskFlowService service;

    @BeforeEach
    void setUp() {
        service = new RiskFlowService(new RiskQuestionBank());
    }

    @Test
    void startThenNextReturnsQuestion() {
        var startReq = new RiskFlowStartRequest();
        var start = service.start("user@example.com", startReq);

        var nextReq = new RiskFlowNextRequest();
        nextReq.setFlowId(start.getFlowId());
        var next = service.next("user@example.com", nextReq);

        assertThat(next.isDone()).isFalse();
        assertThat(next.getQuestion()).isNotBlank();
        assertThat(next.getIndex()).isEqualTo(1);
        assertThat(next.getTotalPlanned()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void nextAdvancesUntilDone() {
        var start = service.start("user@example.com", new RiskFlowStartRequest());
        var req = new RiskFlowNextRequest();
        req.setFlowId(start.getFlowId());

        int steps = 0;
        boolean done = false;
        while (!done && steps < 20) {
            var resp = service.next("user@example.com", req);
            steps++;
            done = resp.isDone();
        }

        assertThat(done).isTrue();
        assertThat(steps).isGreaterThan(0);
        assertThat(steps).isLessThanOrEqualTo(11); // 10 questions + final done state
    }
}

