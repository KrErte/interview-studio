package ee.kerrete.ainterview.arena.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CoverLetterResponse {
    private Long sessionId;
    private String coverLetter;
    private List<String> highlights;
    private String tone;
    private String summary;
}
