package ee.kerrete.ainterview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeAnswerResponse {
    private int score; // 1-5
    private String feedback;
    private String suggestion;
}
