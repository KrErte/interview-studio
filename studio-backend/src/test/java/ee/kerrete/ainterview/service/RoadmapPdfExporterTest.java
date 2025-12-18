package ee.kerrete.ainterview.service;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoadmapPdfExporterTest {

    @Test
    void exportSummaryPdf_createsPdfBytes() {
        RoadmapPdfExporter exporter = new RoadmapPdfExporter();

        List<String> lines = IntStream.range(0, 25)
                .mapToObj(i -> "Line " + i + " - This is a sample roadmap step with descriptive text to ensure wrapping.")
                .toList();

        byte[] pdf = exporter.exportSummaryPdf("Roadmap PDF Sample", 72, lines);

        assertNotNull(pdf);
        assertTrue(pdf.length > 500, "Expected PDF to be larger than 500 bytes");
    }
}

