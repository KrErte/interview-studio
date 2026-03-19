package ee.kerrete.ainterview.arena.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyPrepResponse {
    private Long sessionId;
    private String companyOverview;
    private String cultureInsights;
    private List<String> commonQuestions;
    private List<String> whatTheyValue;
    private List<String> prepTips;
    private List<String> redFlags;
}
