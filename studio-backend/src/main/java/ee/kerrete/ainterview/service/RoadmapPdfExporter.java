package ee.kerrete.ainterview.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class RoadmapPdfExporter {

    public byte[] exportSummaryPdf(String title, int progressPercent, List<String> lines) {
        String safeTitle = title == null || title.isBlank() ? "Roadmap Summary" : title.trim();
        List<String> safeLines = lines == null ? Collections.emptyList() : lines;

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDFont titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDFont bodyFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            float margin = 50f;
            float width = page.getMediaBox().getWidth() - 2 * margin;
            float startY = page.getMediaBox().getHeight() - margin;

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, startY);

                float titleFontSize = 18f;
                float titleLeading = 22f;
                contentStream.setFont(titleFont, titleFontSize);
                contentStream.setLeading(titleLeading);
                for (String line : wrapText(safeTitle, titleFont, titleFontSize, width)) {
                    contentStream.showText(line);
                    contentStream.newLine();
                }

                float bodyFontSize = 12f;
                float bodyLeading = 16f;
                contentStream.setFont(bodyFont, bodyFontSize);
                contentStream.setLeading(bodyLeading);

                contentStream.showText("Progress: " + progressPercent + "%");
                contentStream.newLine();
                contentStream.newLine();

                for (String line : safeLines) {
                    List<String> wrapped = wrapText(line, bodyFont, bodyFontSize, width);
                    if (wrapped.isEmpty()) {
                        contentStream.showText("");
                        contentStream.newLine();
                        continue;
                    }
                    for (String subLine : wrapped) {
                        contentStream.showText(subLine);
                        contentStream.newLine();
                    }
                }

                contentStream.endText();
            }

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                document.save(out);
                return out.toByteArray();
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to render roadmap PDF", e);
        }
    }

    private List<String> wrapText(String text, PDFont font, float fontSize, float maxWidth) {
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }

        List<String> lines = new ArrayList<>();
        String[] paragraphs = text.split("\\r?\\n");
        for (String paragraph : paragraphs) {
            wrapParagraph(paragraph.trim(), font, fontSize, maxWidth, lines);
        }
        return lines;
    }

    private void wrapParagraph(String paragraph,
                               PDFont font,
                               float fontSize,
                               float maxWidth,
                               List<String> collector) {
        if (paragraph.isEmpty()) {
            collector.add("");
            return;
        }

        String[] words = paragraph.split("\\s+");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            if (currentLine.length() == 0) {
                currentLine.append(word);
                continue;
            }

            String candidate = currentLine + " " + word;
            if (textWidth(candidate, font, fontSize) <= maxWidth) {
                currentLine.append(" ").append(word);
            } else {
                collector.add(currentLine.toString());
                currentLine.setLength(0);
                if (textWidth(word, font, fontSize) <= maxWidth) {
                    currentLine.append(word);
                } else {
                    collector.addAll(breakLongWord(word, font, fontSize, maxWidth));
                }
            }
        }

        if (currentLine.length() > 0) {
            collector.add(currentLine.toString());
        }
    }

    private List<String> breakLongWord(String word, PDFont font, float fontSize, float maxWidth) {
        List<String> parts = new ArrayList<>();
        StringBuilder buffer = new StringBuilder();
        for (char ch : word.toCharArray()) {
            buffer.append(ch);
            if (textWidth(buffer.toString(), font, fontSize) >= maxWidth) {
                parts.add(buffer.toString());
                buffer.setLength(0);
            }
        }
        if (buffer.length() > 0) {
            parts.add(buffer.toString());
        }
        return parts;
    }

    private float textWidth(String text, PDFont font, float fontSize) {
        try {
            return font.getStringWidth(text) / 1000f * fontSize;
        } catch (Exception e) {
            return maxWidthFallback(text, fontSize);
        }
    }

    private float maxWidthFallback(String text, float fontSize) {
        return text.length() * fontSize * 0.6f;
    }
}

