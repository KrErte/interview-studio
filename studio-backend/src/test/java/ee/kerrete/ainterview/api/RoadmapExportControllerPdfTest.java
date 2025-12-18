package ee.kerrete.ainterview.api;

import ee.kerrete.ainterview.dto.RoadmapExportResponse;
import ee.kerrete.ainterview.roadmap.MarkdownRenderer;
import ee.kerrete.ainterview.service.RoadmapExportService;
import ee.kerrete.ainterview.service.RoadmapPdfExporter;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoadmapExportController.class)
@Import(RoadmapPdfExporter.class)
class RoadmapExportControllerPdfTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoadmapExportService roadmapExportService;

    @MockBean
    private MarkdownRenderer markdownRenderer;

    @Test
    void pdfExport_returnsAttachment() throws Exception {
        UUID session = UUID.randomUUID();
        RoadmapExportResponse response = RoadmapExportResponse.builder()
                .sessionUuid(session)
                .generatedAt(Instant.now().toString())
                .timelineDays(7)
                .progressPercent(75)
                .topWeaknesses(List.of("Depth", "Consistency"))
                .roadmapItems(List.of(
                        RoadmapExportResponse.RoadmapItem.builder()
                                .day(1)
                                .title("Start")
                                .tasks(List.of("Read brief"))
                                .checkpoint("Note")
                                .build(),
                        RoadmapExportResponse.RoadmapItem.builder()
                                .day(2)
                                .title("Practice")
                                .tasks(List.of("Do tasks"))
                                .checkpoint("Update")
                                .build()
                ))
                .build();

        Mockito.when(roadmapExportService.export(any())).thenReturn(response);

        byte[] bytes = mockMvc.perform(get("/api/roadmap/export/pdf")
                        .param("sessionUuid", session.toString())
                        .param("timelineDays", "7"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        String disposition = mockMvc.perform(get("/api/roadmap/export/pdf")
                        .param("sessionUuid", session.toString())
                        .param("timelineDays", "7"))
                .andReturn()
                .getResponse()
                .getHeader("Content-Disposition");

        assertThat(disposition).contains("attachment");
        assertThat(disposition).contains("roadmap-" + session);
        assertThat(disposition).contains("7d.pdf");
        assertThat(mockMvc.perform(get("/api/roadmap/export/pdf")
                        .param("sessionUuid", session.toString())
                        .param("timelineDays", "7"))
                .andReturn()
                .getResponse()
                .getContentType()).isEqualTo(MediaType.APPLICATION_PDF_VALUE);
        assertThat(bytes).isNotNull();
        assertThat(bytes.length).isGreaterThan(500);
    }
}

