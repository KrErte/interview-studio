package ee.kerrete.ainterview.risk.dto;

import lombok.Data;
import java.util.List;

@Data
public class RefineResponse {
    private String analysisId;
    private String phase;
    private int replaceabilityPct;
    private int deltaPct;
    private String riskLabel;
    private String confidence;
    private List<String> strengths;
    private List<String> risks;
    private List<String> whatChanged;
    private Roadmap roadmap;

    @Data
    public static class Roadmap {
        private int days;
        private List<Item> items;
    }

    @Data
    public static class Item {
        private int day;
        private String title;
        private List<String> actions;
        private String output;
        private String impact;
    }
}
