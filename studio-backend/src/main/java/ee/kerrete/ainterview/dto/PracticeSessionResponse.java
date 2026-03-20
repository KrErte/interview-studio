package ee.kerrete.ainterview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionResponse {
    private String sessionId;
    private List<PracticeQuestionDto> questions;
}
