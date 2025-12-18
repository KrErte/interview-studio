package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.auth.util.SecurityUtils;
import ee.kerrete.ainterview.dto.MindsetRoadmapDetail;
import ee.kerrete.ainterview.dto.MindsetRoadmapSummary;
import ee.kerrete.ainterview.dto.TrainingTaskRequest;
import ee.kerrete.ainterview.service.MindsetRoadmapService;
import ee.kerrete.ainterview.service.RoadmapMarkdownExporter;
import ee.kerrete.ainterview.service.TrainingStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for mindset roadmaps.
 *
 * Endpoints:
 * - GET  /api/mindset/roadmaps              - List all roadmaps with progress
 * - GET  /api/mindset/roadmaps/{roadmapKey} - Get detailed roadmap
 * - POST /api/mindset/task                  - Update task completion
 * - GET  /api/mindset/roadmaps/{key}/export/markdown - Export single roadmap
 * - GET  /api/mindset/roadmaps/export/markdown       - Export all roadmaps
 */
@RestController
@RequestMapping("/api/mindset")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MindsetRoadmapController {

    private final MindsetRoadmapService mindsetRoadmapService;
    private final RoadmapMarkdownExporter markdownExporter;
    private final TrainingStatusService trainingStatusService;

    /**
     * Get all mindset roadmaps for the current user.
     */
    @GetMapping("/roadmaps")
    public List<MindsetRoadmapSummary> getRoadmaps(@RequestParam(required = false) String email) {
        String userEmail = resolveEmail(email);
        return mindsetRoadmapService.getRoadmapsForEmail(userEmail);
    }

    /**
     * Get detailed view of a specific roadmap.
     */
    @GetMapping("/roadmaps/{roadmapKey}")
    public MindsetRoadmapDetail getRoadmapDetail(
            @PathVariable String roadmapKey,
            @RequestParam(required = false) String email) {
        String userEmail = resolveEmail(email);
        return mindsetRoadmapService.getRoadmapDetail(userEmail, roadmapKey);
    }

    /**
     * Update a training task's completion status.
     */
    @PostMapping("/task")
    public MindsetRoadmapDetail updateTask(@RequestBody TrainingTaskRequest request) {
        String userEmail = resolveEmail(request.getEmail());

        boolean completed = Boolean.TRUE.equals(request.getCompleted());
        trainingStatusService.setTaskCompleted(userEmail, request.getTaskKey(), completed);

        String roadmapKey = mindsetRoadmapService.resolveRoadmapKeyFromTaskKey(request.getTaskKey());
        return mindsetRoadmapService.getRoadmapDetail(userEmail, roadmapKey);
    }

    /**
     * Export a single roadmap to Markdown format.
     *
     * Returns: text/markdown file download
     */
    @GetMapping("/roadmaps/{roadmapKey}/export/markdown")
    public ResponseEntity<byte[]> exportRoadmapToMarkdown(
            @PathVariable String roadmapKey,
            @RequestParam(required = false) String email) {
        String userEmail = resolveEmail(email);
        MindsetRoadmapDetail detail = mindsetRoadmapService.getRoadmapDetail(userEmail, roadmapKey);

        if (detail == null || detail.getSummary() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Roadmap not found");
        }

        String markdown = markdownExporter.exportToMarkdown(detail);
        String filename = generateFilename(roadmapKey);

        return createMarkdownResponse(markdown, filename);
    }

    /**
     * Export all roadmaps to a single Markdown document.
     *
     * Returns: text/markdown file download
     */
    @GetMapping("/roadmaps/export/markdown")
    public ResponseEntity<byte[]> exportAllRoadmapsToMarkdown(
            @RequestParam(required = false) String email) {
        String userEmail = resolveEmail(email);
        List<MindsetRoadmapSummary> summaries = mindsetRoadmapService.getRoadmapsForEmail(userEmail);

        if (summaries.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No roadmaps found");
        }

        // Fetch detailed data for each roadmap
        List<MindsetRoadmapDetail> details = summaries.stream()
                .map(s -> mindsetRoadmapService.getRoadmapDetail(userEmail, s.getRoadmapKey()))
                .collect(Collectors.toList());

        String markdown = markdownExporter.exportAllToMarkdown(details, userEmail);
        String filename = "roadmaps-export-" + LocalDate.now().format(DateTimeFormatter.ISO_DATE) + ".md";

        return createMarkdownResponse(markdown, filename);
    }

    /**
     * Preview markdown export (returns raw markdown text, not download).
     */
    @GetMapping("/roadmaps/{roadmapKey}/export/markdown/preview")
    public ResponseEntity<String> previewRoadmapMarkdown(
            @PathVariable String roadmapKey,
            @RequestParam(required = false) String email) {
        String userEmail = resolveEmail(email);
        MindsetRoadmapDetail detail = mindsetRoadmapService.getRoadmapDetail(userEmail, roadmapKey);

        if (detail == null || detail.getSummary() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Roadmap not found");
        }

        String markdown = markdownExporter.exportToMarkdown(detail);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(markdown);
    }

    private String resolveEmail(String requestEmail) {
        // Try to get email from security context first
        return SecurityUtils.getEmailFromSecurityContext()
                .filter(StringUtils::hasText)
                .orElseGet(() -> {
                    // Fall back to request parameter if not authenticated
                    if (StringUtils.hasText(requestEmail)) {
                        return requestEmail;
                    }
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email required");
                });
    }

    private ResponseEntity<byte[]> createMarkdownResponse(String markdown, String filename) {
        byte[] content = markdown.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "markdown", StandardCharsets.UTF_8));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(content.length);

        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }

    private String generateFilename(String roadmapKey) {
        String date = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String sanitizedKey = roadmapKey.replaceAll("[^a-zA-Z0-9_-]", "_");
        return "roadmap-" + sanitizedKey + "-" + date + ".md";
    }
}
