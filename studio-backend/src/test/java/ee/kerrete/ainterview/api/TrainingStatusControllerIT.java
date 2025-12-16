package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.AbstractIntegrationTest;
import ee.kerrete.ainterview.model.UserRole;
import ee.kerrete.ainterview.repository.TrainingProgressRepository;
import ee.kerrete.ainterview.repository.TrainingTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TrainingStatusControllerIT extends AbstractIntegrationTest {

    @Autowired
    TrainingTaskRepository trainingTaskRepository;

    @Autowired
    TrainingProgressRepository trainingProgressRepository;

    @BeforeEach
    void cleanTrainingData() {
        trainingTaskRepository.deleteAll();
        trainingProgressRepository.deleteAll();
    }

    @Test
    void status_shouldReturnDefaults_whenNoTrainingData() throws Exception {
        String email = "user@example.com";
        String password = "password";
        createUser(email, password, true, UserRole.USER);
        String token = loginAndGetToken(email, password);

        mockMvc.perform(get("/api/training/status")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks").value(0))
                .andExpect(jsonPath("$.completedTasks").value(0))
                .andExpect(jsonPath("$.progressPercent").value(0))
                .andExpect(jsonPath("$.tasks", hasSize(0)));
    }
}

