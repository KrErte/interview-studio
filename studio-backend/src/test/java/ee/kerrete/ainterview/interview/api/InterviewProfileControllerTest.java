package ee.kerrete.ainterview.interview.api;

import ee.kerrete.ainterview.AbstractIntegrationTest;
import ee.kerrete.ainterview.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class InterviewProfileControllerTest extends AbstractIntegrationTest {

    @Test
    void uploadProfile_returnsProfileJson() throws Exception {
        createUser("profile@example.com", "Password1!", true, UserRole.USER);
        String token = loginAndGetToken("profile@example.com", "Password1!");

        MockMultipartFile file = new MockMultipartFile(
            "file",
            "cv.txt",
            MediaType.TEXT_PLAIN_VALUE,
            "Senior backend engineer with 7 years of Java and Spring experience.".getBytes()
        );

        mockMvc.perform(multipart("/api/interview-profile")
                .file(file)
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.candidateKeySkills").isArray())
            .andExpect(jsonPath("$.interviewerProbePriorities").isArray())
            .andExpect(jsonPath("$.uploadedAt").isNotEmpty());
    }
}

