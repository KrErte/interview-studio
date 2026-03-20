package ee.kerrete.ainterview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeQuestionDto {
    private String id;
    private String text;
    private String blocker;
    private String tip;
}
