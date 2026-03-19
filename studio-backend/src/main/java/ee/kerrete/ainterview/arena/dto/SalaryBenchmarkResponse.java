package ee.kerrete.ainterview.arena.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryBenchmarkResponse {
    private Long sessionId;
    private String role;
    private String location;
    private String currency;
    private Integer minSalary;
    private Integer medianSalary;
    private Integer maxSalary;
    private Integer p25;
    private Integer p75;
    private List<LocationComparison> locationComparisons;
    private String marketInsights;
    private List<String> negotiationTips;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LocationComparison {
        private String location;
        private Integer medianSalary;
        private String costOfLivingIndex;
    }
}
