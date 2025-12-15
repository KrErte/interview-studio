package ee.kerrete.ainterview.interview.api;

import ee.kerrete.ainterview.interview.dto.InterviewProfileDto;
import ee.kerrete.ainterview.interview.service.InterviewProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewCvController {

    private final InterviewProfileService interviewProfileService;

    @PostMapping(value = "/{sessionUuid}/cv/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public InterviewProfileDto uploadCv(@PathVariable("sessionUuid") UUID sessionUuid,
                                        @RequestPart("file") MultipartFile file) {
        return interviewProfileService.uploadAndBuild(sessionUuid, file);
    }

    @GetMapping("/{sessionUuid}/profile")
    public InterviewProfileDto profile(@PathVariable("sessionUuid") UUID sessionUuid) {
        return interviewProfileService.loadProfile(sessionUuid);
    }
}



