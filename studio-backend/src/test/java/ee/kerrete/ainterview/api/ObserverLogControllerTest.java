package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.service.ObserverLogService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ObserverLogController.class)
class ObserverLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ObserverLogService observerLogService;

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

