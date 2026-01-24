package ee.kerrete.ainterview.email;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send-results")
    public ResponseEntity<?> sendAssessmentResults(@Valid @RequestBody SendResultsRequest request) {
        AssessmentEmailData data = AssessmentEmailData.builder()
                .role(request.getRole())
                .riskPercent(request.getRiskPercent())
                .confidence(request.getConfidence())
                .assessmentUrl(request.getAssessmentUrl())
                .build();

        emailService.sendAssessmentResults(request.getEmail(), data);

        return ResponseEntity.ok().body(new SendResultsResponse("Email saadetud!"));
    }

    @Data
    public static class SendResultsRequest {
        @NotBlank
        @Email
        private String email;

        @NotBlank
        private String role;

        private int riskPercent;
        private int confidence;

        @NotBlank
        private String assessmentUrl;
    }

    @Data
    public static class SendResultsResponse {
        private final String message;
    }
}
