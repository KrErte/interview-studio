package ee.kerrete.ainterview.og;

import ee.kerrete.ainterview.session.dto.SessionResponse;
import ee.kerrete.ainterview.session.service.CareerSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/og")
@RequiredArgsConstructor
public class OgController {

    private final CareerSessionService sessionService;

    @GetMapping(value = "/share/{shareId}", produces = MediaType.TEXT_HTML_VALUE)
    public String getShareOg(@PathVariable String shareId) {
        try {
            SessionResponse session = sessionService.getByShareId(shareId);
            String title = "Career Risk: " + session.targetRole() + " — " + session.status();
            String description = "AI career risk assessment for " + session.targetRole() + ". Status: " + session.status();
            return buildOgHtml(title, description, shareId);
        } catch (Exception e) {
            return buildOgHtml(
                "CareerRisk — AI Career Risk Assessment",
                "Free 3-minute AI career risk assessment. Find out if your job is at risk.",
                shareId
            );
        }
    }

    private String buildOgHtml(String title, String description, String shareId) {
        String url = "https://careerrisk.ee/share/" + shareId;
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta property="og:title" content="%s">
              <meta property="og:description" content="%s">
              <meta property="og:image" content="https://careerrisk.ee/assets/og-image.png">
              <meta property="og:url" content="%s">
              <meta property="og:type" content="website">
              <meta name="twitter:card" content="summary_large_image">
              <meta http-equiv="refresh" content="0;url=%s">
            </head>
            <body></body>
            </html>
            """.formatted(title, description, url, url);
    }
}
