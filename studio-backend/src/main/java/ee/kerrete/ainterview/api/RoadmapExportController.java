package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.dto.RoadmapExportRequest;
import ee.kerrete.ainterview.dto.RoadmapExportResponse;
import ee.kerrete.ainterview.roadmap.MarkdownRenderer;
import ee.kerrete.ainterview.service.RoadmapExportService;
import ee.kerrete.ainterview.service.RoadmapPdfExporter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapExportController {

    private final RoadmapExportService roadmapExportService;
    private final MarkdownRenderer markdownRenderer;
    private final RoadmapPdfExporter roadmapPdfExporter;

    @PostMapping(value = "/export")
    public ResponseEntity<?> export(@RequestBody RoadmapExportRequest request) {
        RoadmapExportResponse response = roadmapExportService.export(request);

        if (request != null && request.resolveFormat() == RoadmapExportRequest.Format.MARKDOWN) {
            String markdown = markdownRenderer.render(response);
            MediaType markdownType = MediaType.TEXT_MARKDOWN != null
                    ? MediaType.TEXT_MARKDOWN
                    : MediaType.valueOf("text/markdown");
            return ResponseEntity.ok()
                    .contentType(markdownType)
                    .body(markdown);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestParam("sessionUuid") UUID sessionUuid,
                                            @RequestParam("timelineDays") Integer timelineDays) {
        if (timelineDays == null || (timelineDays != 7 && timelineDays != 30 && timelineDays != 90)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "timelineDays must be 7, 30 or 90");
        }

        RoadmapExportRequest request = RoadmapExportRequest.builder()
                .sessionUuid(sessionUuid)
                .timelineDays(timelineDays)
                .format(RoadmapExportRequest.Format.JSON)
                .build();

        RoadmapExportResponse response = roadmapExportService.export(request);
        byte[] pdf = roadmapPdfExporter.exportSummaryPdf(
                "Personalized Roadmap",
                response.getProgressPercent(),
                buildLines(response)
        );

        String filename = "roadmap-" + sessionUuid + "-" + timelineDays + "d.pdf";
        MediaType pdfType = MediaType.APPLICATION_PDF != null ? MediaType.APPLICATION_PDF : MediaType.valueOf("application/pdf");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(pdfType)
                .body(pdf);
    }

    private List<String> buildLines(RoadmapExportResponse response) {
        List<String> lines = new ArrayList<>();
        lines.add("Session: " + response.getSessionUuid());
        lines.add("Timeline: " + response.getTimelineDays() + " days");
        lines.add("Generated: " + response.getGeneratedAt());
        lines.add("Progress: " + response.getProgressPercent() + "%");

        if (response.getTopWeaknesses() != null && !response.getTopWeaknesses().isEmpty()) {
            String weaknesses = response.getTopWeaknesses().stream()
                    .limit(3)
                    .collect(Collectors.joining("; "));
            lines.add("Top weaknesses: " + weaknesses);
        }

        if (response.getRoadmapItems() != null && !response.getRoadmapItems().isEmpty()) {
            lines.add("Next tasks:");
            response.getRoadmapItems().stream()
                    .sorted((a, b) -> Integer.compare(a.getDay(), b.getDay()))
                    .limit(4)
                    .forEach(item -> {
                        String title = item.getTitle() != null ? item.getTitle() : "Task";
                        lines.add("- Day " + item.getDay() + ": " + title);
                        if (item.getTasks() != null && !item.getTasks().isEmpty()) {
                            lines.add("  " + item.getTasks().get(0));
                        }
                    });
        }

        while (lines.size() > 12) {
            lines.remove(lines.size() - 1);
        }
        return lines;
    }
}

