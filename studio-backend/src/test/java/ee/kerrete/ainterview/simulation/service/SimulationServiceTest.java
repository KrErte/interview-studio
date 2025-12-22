package ee.kerrete.ainterview.simulation.service;

import ee.kerrete.ainterview.simulation.dto.SimulateAiCapabilityRequest;
import ee.kerrete.ainterview.simulation.dto.SimulateSkillRequest;
import ee.kerrete.ainterview.simulation.dto.SimulationOptionsResponse;
import ee.kerrete.ainterview.simulation.dto.SimulationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for SimulationService.
 */
class SimulationServiceTest {

    private SimulationService service;

    @BeforeEach
    void setUp() {
        service = new SimulationService();
    }

    @Nested
    @DisplayName("simulateSkill tests")
    class SimulateSkillTests {

        @Test
        @DisplayName("Python skill reduces data-processing task exposure")
        void pythonReducesDataProcessingExposure() {
            SimulateSkillRequest request = new SimulateSkillRequest();
            request.setSessionId(UUID.randomUUID().toString());
            request.setSkillId("python");

            SimulationResponse response = service.simulateSkill(request);

            assertThat(response.getOriginalExposure()).isGreaterThan(0);
            assertThat(response.getSimulatedExposure()).isLessThan(response.getOriginalExposure());
            assertThat(response.getDelta()).isNegative();
            assertThat(response.getAffectedTasks()).isNotEmpty();

            // Verify data-related tasks are affected
            boolean hasDataTask = response.getAffectedTasks().stream()
                    .anyMatch(t -> t.getTaskName().toLowerCase().contains("data"));
            assertThat(hasDataTask).isTrue();
        }

        @Test
        @DisplayName("Stakeholder management skill reduces communication exposure")
        void stakeholderReducesCommunicationExposure() {
            SimulateSkillRequest request = new SimulateSkillRequest();
            request.setSessionId(UUID.randomUUID().toString());
            request.setSkillId("stakeholder-management");

            SimulationResponse response = service.simulateSkill(request);

            assertThat(response.getDelta()).isNegative();

            boolean hasCommunicationTask = response.getAffectedTasks().stream()
                    .anyMatch(t -> t.getTaskName().toLowerCase().contains("communication") ||
                                   t.getTaskName().toLowerCase().contains("client"));
            assertThat(hasCommunicationTask).isTrue();
        }

        @Test
        @DisplayName("Unknown skill throws exception")
        void unknownSkillThrowsException() {
            SimulateSkillRequest request = new SimulateSkillRequest();
            request.setSessionId(UUID.randomUUID().toString());
            request.setSkillId("unknown-skill");

            assertThatThrownBy(() -> service.simulateSkill(request))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Unknown skill");
        }

        @Test
        @DisplayName("Affected tasks have valid explanations")
        void affectedTasksHaveExplanations() {
            SimulateSkillRequest request = new SimulateSkillRequest();
            request.setSessionId(UUID.randomUUID().toString());
            request.setSkillId("python");

            SimulationResponse response = service.simulateSkill(request);

            for (SimulationResponse.AffectedTask task : response.getAffectedTasks()) {
                assertThat(task.getExplanation()).isNotBlank();
                assertThat(task.getSimulatedExposure()).isLessThanOrEqualTo(task.getOriginalExposure());
            }
        }
    }

    @Nested
    @DisplayName("simulateAiCapability tests")
    class SimulateAiCapabilityTests {

        @Test
        @DisplayName("Advanced code generation increases coding task exposure")
        void codeGenIncreasesCodingExposure() {
            SimulateAiCapabilityRequest request = new SimulateAiCapabilityRequest();
            request.setSessionId(UUID.randomUUID().toString());
            request.setCapabilityId("code-gen-v2");

            SimulationResponse response = service.simulateAiCapability(request);

            assertThat(response.getOriginalExposure()).isGreaterThan(0);
            assertThat(response.getSimulatedExposure()).isGreaterThan(response.getOriginalExposure());
            assertThat(response.getDelta()).isPositive();
            assertThat(response.getAffectedTasks()).isNotEmpty();

            boolean hasCodingTask = response.getAffectedTasks().stream()
                    .anyMatch(t -> t.getTaskName().toLowerCase().contains("code"));
            assertThat(hasCodingTask).isTrue();
        }

        @Test
        @DisplayName("Autonomous agents increase all task exposures")
        void agenticIncreasesAllExposures() {
            SimulateAiCapabilityRequest request = new SimulateAiCapabilityRequest();
            request.setSessionId(UUID.randomUUID().toString());
            request.setCapabilityId("agentic-v1");

            SimulationResponse response = service.simulateAiCapability(request);

            assertThat(response.getDelta()).isPositive();
            // Agentic should affect more tasks than other capabilities
            assertThat(response.getAffectedTasks().size()).isGreaterThanOrEqualTo(5);
        }

        @Test
        @DisplayName("Unknown AI capability throws exception")
        void unknownCapabilityThrowsException() {
            SimulateAiCapabilityRequest request = new SimulateAiCapabilityRequest();
            request.setSessionId(UUID.randomUUID().toString());
            request.setCapabilityId("unknown-capability");

            assertThatThrownBy(() -> service.simulateAiCapability(request))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Unknown AI capability");
        }

        @Test
        @DisplayName("Exposure is capped at 100")
        void exposureCappedAt100() {
            SimulateAiCapabilityRequest request = new SimulateAiCapabilityRequest();
            request.setSessionId(UUID.randomUUID().toString());
            request.setCapabilityId("agentic-v1");

            SimulationResponse response = service.simulateAiCapability(request);

            assertThat(response.getSimulatedExposure()).isLessThanOrEqualTo(100);
            for (SimulationResponse.AffectedTask task : response.getAffectedTasks()) {
                assertThat(task.getSimulatedExposure()).isLessThanOrEqualTo(100);
            }
        }
    }

    @Nested
    @DisplayName("getOptions tests")
    class GetOptionsTests {

        @Test
        @DisplayName("Returns all skills and AI capabilities")
        void returnsAllOptions() {
            SimulationOptionsResponse options = service.getOptions();

            assertThat(options.getSkills()).isNotEmpty();
            assertThat(options.getAiCapabilities()).isNotEmpty();

            // Verify skills have required fields
            for (SimulationOptionsResponse.SkillOption skill : options.getSkills()) {
                assertThat(skill.getId()).isNotBlank();
                assertThat(skill.getName()).isNotBlank();
                assertThat(skill.getCategory()).isNotBlank();
            }

            // Verify AI capabilities have required fields
            for (SimulationOptionsResponse.AiCapabilityOption cap : options.getAiCapabilities()) {
                assertThat(cap.getId()).isNotBlank();
                assertThat(cap.getName()).isNotBlank();
                assertThat(cap.getImpactLevel()).isNotBlank();
            }
        }

        @Test
        @DisplayName("Skills include expected categories")
        void skillsHaveExpectedCategories() {
            SimulationOptionsResponse options = service.getOptions();

            List<String> categories = options.getSkills().stream()
                    .map(SimulationOptionsResponse.SkillOption::getCategory)
                    .distinct()
                    .toList();

            assertThat(categories).contains("technical", "ai", "soft");
        }

        @Test
        @DisplayName("AI capabilities include impact levels")
        void capabilitiesHaveImpactLevels() {
            SimulationOptionsResponse options = service.getOptions();

            List<String> levels = options.getAiCapabilities().stream()
                    .map(SimulationOptionsResponse.AiCapabilityOption::getImpactLevel)
                    .distinct()
                    .toList();

            assertThat(levels).contains("high", "medium", "extreme");
        }
    }

    @Nested
    @DisplayName("storeAssessment tests")
    class StoreAssessmentTests {

        @Test
        @DisplayName("Stored assessment is used in subsequent simulations")
        void storedAssessmentIsUsed() {
            String sessionId = UUID.randomUUID().toString();

            // Store custom assessment with high data-processing exposure
            service.storeAssessment(sessionId, 80, List.of(
                    new SimulationService.TaskExposure("t1", "Heavy data processing", "data-processing", 95),
                    new SimulationService.TaskExposure("t2", "Light communication", "communication", 20)
            ));

            SimulateSkillRequest request = new SimulateSkillRequest();
            request.setSessionId(sessionId);
            request.setSkillId("python");

            SimulationResponse response = service.simulateSkill(request);

            // Python should reduce data-processing exposure significantly
            assertThat(response.getAffectedTasks()).hasSize(1);
            assertThat(response.getAffectedTasks().get(0).getTaskName()).isEqualTo("Heavy data processing");
            assertThat(response.getAffectedTasks().get(0).getOriginalExposure()).isEqualTo(95);
        }
    }
}
