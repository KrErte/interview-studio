package ee.kerrete.ainterview.roadmap;

import ee.kerrete.ainterview.dto.RoadmapExportResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Comparator;
import java.util.List;

@Component
public class MarkdownRenderer {

    public String render(RoadmapExportResponse response) {
        StringBuilder sb = new StringBuilder();
        sb.append("# Roadmap Export").append("\n\n");
        sb.append("**Session:** ").append(response.getSessionUuid()).append("\n");
        sb.append("**Generated:** ").append(response.getGeneratedAt()).append("\n");
        sb.append("**Timeline:** ").append(response.getTimelineDays()).append(" days").append("\n");
        sb.append("**Progress:** ").append(response.getProgressPercent()).append("%").append("\n\n");

        RoadmapExportResponse.RiskAssessment risk = response.getRiskAssessment();
        if (risk != null) {
            sb.append("## Risk Assessment").append("\n");
            sb.append("- Risk: ").append(risk.getRiskPercent()).append("%").append("\n");
            sb.append("- Band: ").append(safe(risk.getBand())).append("\n");
            sb.append("- Confidence: ").append(risk.getConfidence() == null ? "n/a" : risk.getConfidence()).append("\n\n");
        }

        List<String> weaknesses = response.getTopWeaknesses();
        if (!CollectionUtils.isEmpty(weaknesses)) {
            sb.append("## Top Weaknesses").append("\n");
            for (String w : weaknesses) {
                sb.append("- ").append(w).append("\n");
            }
            sb.append("\n");
        }

        List<RoadmapExportResponse.RoadmapItem> items = response.getRoadmapItems();
        if (!CollectionUtils.isEmpty(items)) {
            sb.append("## Roadmap").append("\n");
            items.stream()
                    .sorted(Comparator.comparingInt(RoadmapExportResponse.RoadmapItem::getDay))
                    .forEach(item -> {
                        sb.append("### Day ").append(item.getDay()).append(": ").append(safe(item.getTitle())).append("\n");
                        if (!CollectionUtils.isEmpty(item.getTasks())) {
                            sb.append("Tasks:\n");
                            for (String task : item.getTasks()) {
                                sb.append("- ").append(task).append("\n");
                            }
                        }
                        if (item.getCheckpoint() != null && !item.getCheckpoint().isBlank()) {
                            sb.append("Checkpoint: ").append(item.getCheckpoint()).append("\n");
                        }
                        sb.append("\n");
                    });
        }

        return sb.toString().trim();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}

