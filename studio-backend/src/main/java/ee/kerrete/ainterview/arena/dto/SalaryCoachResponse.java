package ee.kerrete.ainterview.arena.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryCoachResponse {
    private Long sessionId;
    private String message;
    private String marketAnalysis;
    private List<String> negotiationStrategies;
    private String recommendedCounter;
    private List<String> talkingPoints;
}
