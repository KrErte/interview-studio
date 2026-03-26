package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.auth.jwt.JwtAuthenticationFilter;
import ee.kerrete.ainterview.auth.jwt.JwtService;
import ee.kerrete.ainterview.service.ObserverLogService;
import ee.kerrete.ainterview.support.SessionIdParser;
import ee.kerrete.ainterview.support.SessionIdParser.SessionIdentifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ObserverLogController.class)
@AutoConfigureMockMvc(addFilters = false)
class ObserverLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ObserverLogService observerLogService;

    @MockBean
    private SessionIdParser sessionIdParser;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtService jwtService;

    @BeforeEach
    void stubSessionIdParser() {
        UUID sessionUuid = UUID.fromString("00000000-0000-0000-0000-000000000123");
        SessionIdentifier identifier = SessionIdentifier.ofUuid(sessionUuid, "00000000-0000-0000-0000-000000000123");
        Mockito.when(sessionIdParser.parseRequired(anyString())).thenReturn(identifier);
    }

    @Test
    void returnsEmptyListWhenNoLogs() throws Exception {
        Mockito.when(observerLogService.getForSession(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/observer-logs")
                        .param("sessionId", "00000000-0000-0000-0000-000000000123"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.length()").value(0));
    }
}
