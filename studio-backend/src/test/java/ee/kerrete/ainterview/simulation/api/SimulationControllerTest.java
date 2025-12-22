package ee.kerrete.ainterview.simulation.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.simulation.dto.SimulateAiCapabilityRequest;
import ee.kerrete.ainterview.simulation.dto.SimulateSkillRequest;
import ee.kerrete.ainterview.simulation.dto.SimulationOptionsResponse;
import ee.kerrete.ainterview.simulation.dto.SimulationResponse;
import ee.kerrete.ainterview.simulation.service.SimulationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Controller tests for SimulationController.
 */
@WebMvcTest(SimulationController.class)
class SimulationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SimulationService simulationService;

    @Test
    @DisplayName("POST /api/simulate/skill returns simulation response")
    void simulateSkill_returnsResponse() throws Exception {
        SimulationResponse mockResponse = SimulationResponse.builder()
                .originalExposure(47)
                .simulatedExposure(39)
                .delta(-8)
                .affectedTasks(List.of(
                        SimulationResponse.AffectedTask.builder()
                                .taskId(UUID.randomUUID().toString())
                                .taskName("Data validation")
                                .originalExposure(72)
                                .simulatedExposure(58)
                                .explanation("Python automates validation but you control the logic")
                                .build()
                ))
                .build();

        when(simulationService.simulateSkill(any(SimulateSkillRequest.class)))
                .thenReturn(mockResponse);

        SimulateSkillRequest request = new SimulateSkillRequest();
        request.setSessionId(UUID.randomUUID().toString());
        request.setSkillId("python");

        mockMvc.perform(post("/api/simulate/skill")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.originalExposure").value(47))
                .andExpect(jsonPath("$.simulatedExposure").value(39))
                .andExpect(jsonPath("$.delta").value(-8))
                .andExpect(jsonPath("$.affectedTasks").isArray())
                .andExpect(jsonPath("$.affectedTasks[0].taskName").value("Data validation"));
    }

    @Test
    @DisplayName("POST /api/simulate/skill validates required fields")
    void simulateSkill_validatesRequiredFields() throws Exception {
        SimulateSkillRequest request = new SimulateSkillRequest();
        // Missing sessionId and skillId

        mockMvc.perform(post("/api/simulate/skill")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/simulate/ai-capability returns simulation response")
    void simulateAiCapability_returnsResponse() throws Exception {
        SimulationResponse mockResponse = SimulationResponse.builder()
                .originalExposure(47)
                .simulatedExposure(62)
                .delta(15)
                .affectedTasks(List.of(
                        SimulationResponse.AffectedTask.builder()
                                .taskId(UUID.randomUUID().toString())
                                .taskName("Code review")
                                .originalExposure(55)
                                .simulatedExposure(75)
                                .explanation("Advanced code generation can handle more complex tasks")
                                .build()
                ))
                .build();

        when(simulationService.simulateAiCapability(any(SimulateAiCapabilityRequest.class)))
                .thenReturn(mockResponse);

        SimulateAiCapabilityRequest request = new SimulateAiCapabilityRequest();
        request.setSessionId(UUID.randomUUID().toString());
        request.setCapabilityId("code-gen-v2");

        mockMvc.perform(post("/api/simulate/ai-capability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.originalExposure").value(47))
                .andExpect(jsonPath("$.simulatedExposure").value(62))
                .andExpect(jsonPath("$.delta").value(15))
                .andExpect(jsonPath("$.affectedTasks[0].taskName").value("Code review"));
    }

    @Test
    @DisplayName("GET /api/simulate/options returns available options")
    void getOptions_returnsOptions() throws Exception {
        SimulationOptionsResponse mockResponse = SimulationOptionsResponse.builder()
                .skills(List.of(
                        SimulationOptionsResponse.SkillOption.builder()
                                .id("python")
                                .name("Python/Automation")
                                .category("technical")
                                .build(),
                        SimulationOptionsResponse.SkillOption.builder()
                                .id("prompt-engineering")
                                .name("Prompt Engineering")
                                .category("ai")
                                .build()
                ))
                .aiCapabilities(List.of(
                        SimulationOptionsResponse.AiCapabilityOption.builder()
                                .id("code-gen-v2")
                                .name("Advanced Code Generation")
                                .impactLevel("high")
                                .build(),
                        SimulationOptionsResponse.AiCapabilityOption.builder()
                                .id("agentic-v1")
                                .name("Autonomous Agents")
                                .impactLevel("extreme")
                                .build()
                ))
                .build();

        when(simulationService.getOptions()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/simulate/options"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.skills").isArray())
                .andExpect(jsonPath("$.skills[0].id").value("python"))
                .andExpect(jsonPath("$.skills[0].name").value("Python/Automation"))
                .andExpect(jsonPath("$.skills[0].category").value("technical"))
                .andExpect(jsonPath("$.aiCapabilities").isArray())
                .andExpect(jsonPath("$.aiCapabilities[0].id").value("code-gen-v2"))
                .andExpect(jsonPath("$.aiCapabilities[1].impactLevel").value("extreme"));
    }
}
