package ee.kerrete.ainterview.interview.api;

import ee.kerrete.ainterview.interview.dto.InterviewProfileDto;
import ee.kerrete.ainterview.interview.service.InterviewProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping({"/api/candidate", "/api"})
@RequiredArgsConstructor
public class InterviewProfileController {

    private final InterviewProfileService interviewProfileService;

    @PostMapping(value = "/interview-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public InterviewProfileDto uploadProfile(@RequestPart("file") MultipartFile file,
                                             @RequestParam(value = "sessionUuid", required = false) UUID sessionUuid) {
        if (sessionUuid != null) {
            return interviewProfileService.uploadAndBuild(sessionUuid, file);
        }
        return interviewProfileService.preview(file);
    }

    @GetMapping("/interview-profile/{sessionUuid}")
    public InterviewProfileDto getProfile(@PathVariable UUID sessionUuid) {
        return interviewProfileService.loadProfile(sessionUuid);
    }
}

