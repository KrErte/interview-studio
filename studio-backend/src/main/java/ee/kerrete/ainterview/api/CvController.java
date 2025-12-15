package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.auth.util.SecurityUtils;
import ee.kerrete.ainterview.dto.CvTextResponse;
import ee.kerrete.ainterview.service.CvSummaryService;
import ee.kerrete.ainterview.interview.service.CvTextExtractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({"/api/candidate/cv", "/api/cv"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CvController {

    private final CvTextExtractService cvTextExtractService;
    private final CvSummaryService cvSummaryService;

    @PostMapping(
            value = "/extract-text",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<CvTextResponse> extractText(
            @RequestPart("file") MultipartFile file
    ) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(CvTextResponse.builder().text("").build());
        }

        String text = cvTextExtractService.extractText(file);
        String email = SecurityUtils.resolveEmailOrAnonymous();
        var summary = cvSummaryService.saveSummary(email, text);

        CvTextResponse response = CvTextResponse.builder()
                .text(text)
                .headline(summary.getHeadline())
                .skills(summary.getParsedSkills())
                .experienceSummary(summary.getExperienceSummary())
                .build();
        return ResponseEntity.ok(response);
    }
}
