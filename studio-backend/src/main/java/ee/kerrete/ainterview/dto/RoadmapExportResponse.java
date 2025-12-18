package ee.kerrete.ainterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapExportResponse {

    private UUID sessionUuid;
    private String generatedAt;
    private int timelineDays;
    private RiskAssessment riskAssessment;
    private List<String> topWeaknesses;
    private List<RoadmapItem> roadmapItems;
    private int progressPercent;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskAssessment {
        private int riskPercent;
        private String band;
        private Double confidence;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoadmapItem {
        private int day;
        private String title;
        private List<String> tasks;
        private String checkpoint;
    }
}

