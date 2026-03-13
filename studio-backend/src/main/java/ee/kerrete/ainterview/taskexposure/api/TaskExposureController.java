package ee.kerrete.ainterview.taskexposure.api;

import ee.kerrete.ainterview.taskexposure.dto.AssessmentResult;
import ee.kerrete.ainterview.taskexposure.dto.QuestionnaireRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * TaskExposure V1 controller.
 * Locked flow: CV upload → questionnaire → free result → payment → paid result
 */
@RestController
@RequestMapping("/api/taskexposure")
@RequiredArgsConstructor
public class TaskExposureController {

    /**
     * Upload CV and extract text.
     * Returns extracted text for inclusion in questionnaire submission.
     */
    @PostMapping("/upload-cv")
    public ResponseEntity<CvUploadResponse> uploadCv(@RequestParam("file") MultipartFile file) {
        // TODO: Wire CV text extraction service
        String extractedText = "CV text extraction placeholder";
        return ResponseEntity.ok(new CvUploadResponse(extractedText));
    }

    /**
     * Submit questionnaire answers.
     * Returns assessment ID for result retrieval.
     */
    @PostMapping("/submit")
    public ResponseEntity<SubmitResponse> submitQuestionnaire(@RequestBody QuestionnaireRequest request) {
        String assessmentId = UUID.randomUUID().toString();
        // TODO: Store questionnaire data, no scoring yet
        return ResponseEntity.ok(new SubmitResponse(assessmentId));
    }

    /**
     * Get free result (status + 3 blockers + teaser).
     */
    @GetMapping("/result/{assessmentId}")
    public ResponseEntity<AssessmentResult> getFreeResult(@PathVariable String assessmentId) {
        // TODO: Wire scoring logic (Day 4)
        AssessmentResult result = AssessmentResult.builder()
                .assessmentId(assessmentId)
                .status(AssessmentResult.Status.YELLOW)
                .blockers(List.of(
                        "Placeholder blocker 1",
                        "Placeholder blocker 2",
                        "Placeholder blocker 3"
                ))
                .teaserAction("Placeholder teaser action")
                .paid(false)
                .build();
        return ResponseEntity.ok(result);
    }

    /**
     * Get paid result (full 30-day plan + CV bullets + roles to avoid).
     * Only returns paid content if payment verified.
     */
    @GetMapping("/result/{assessmentId}/paid")
    public ResponseEntity<AssessmentResult> getPaidResult(@PathVariable String assessmentId) {
        // TODO: Verify payment, return full result
        AssessmentResult result = AssessmentResult.builder()
                .assessmentId(assessmentId)
                .status(AssessmentResult.Status.YELLOW)
                .blockers(List.of(
                        "Placeholder blocker 1",
                        "Placeholder blocker 2",
                        "Placeholder blocker 3"
                ))
                .teaserAction("Placeholder teaser action")
                .plan(List.of(
                        AssessmentResult.PlanAction.builder().day(1).action("Placeholder action 1").outcome("Outcome 1").build(),
                        AssessmentResult.PlanAction.builder().day(7).action("Placeholder action 2").outcome("Outcome 2").build()
                ))
                .cvRewriteBullets(List.of("CV bullet 1", "CV bullet 2"))
                .rolesToAvoid(List.of("Role to avoid 1"))
                .pivotSuggestion(null)
                .paid(true)
                .build();
        return ResponseEntity.ok(result);
    }

    public record CvUploadResponse(String cvText) {}
    public record SubmitResponse(String assessmentId) {}
}
