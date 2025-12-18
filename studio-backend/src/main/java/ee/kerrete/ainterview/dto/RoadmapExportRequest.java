package ee.kerrete.ainterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapExportRequest {

    private UUID sessionUuid;

    /**
     * Desired output format. Defaults to JSON when null/unknown.
     */
    private Format format;

    /**
     * Supported values: 7, 30, 90.
     */
    private Integer timelineDays;

    public enum Format {
        JSON,
        MARKDOWN
    }

    public Format resolveFormat() {
        return format == null ? Format.JSON : format;
    }
}

