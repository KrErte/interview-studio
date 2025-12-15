package ee.kerrete.ainterview.interview.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class CvTextExtractService {

    /**
     * Minimal deterministic extractor.
     * - For text/* content types or .txt files, read UTF-8 text.
     * - Otherwise return a safe placeholder so pipeline stays deterministic.
     */
    public String extractText(MultipartFile file) {
        if (file == null) {
            return "";
        }
        String contentType = file.getContentType();
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        boolean treatAsText = (contentType != null && contentType.toLowerCase().startsWith("text/")) || name.endsWith(".txt");
        if (treatAsText) {
            try {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                log.warn("Failed to read text CV file '{}'", name, e);
                return "";
            }
        }
        return "[unsupported file type]";
    }
}


