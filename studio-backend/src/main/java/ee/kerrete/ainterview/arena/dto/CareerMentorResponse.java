package ee.kerrete.ainterview.arena.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CareerMentorResponse {
    private Long sessionId;
    private String message;
    private List<String> actionItems;
    private List<String> resourceLinks;
    private String careerOutlook;
}
