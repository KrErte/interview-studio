package ee.kerrete.ainterview.arena.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class LinkedinGeneratorResponse {
    private Long sessionId;
    private String headline;
    private String aboutSection;
    private List<String> experienceBullets;
    private List<String> skillsToHighlight;
    private String summary;
}
