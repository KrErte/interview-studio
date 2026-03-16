package ee.kerrete.ainterview.arena.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class JobXrayResponse {
    private String seniority;
    private List<String> realRequirements;
    private List<String> hiddenRequirements;
    private String salaryEstimate;
    private List<String> redFlags;
    private List<String> greenFlags;
    private List<String> atsKeywords;
    private String cultureSignals;
    private List<String> fitTips;
    private long usageCount;
    private int usageLimit;
}
