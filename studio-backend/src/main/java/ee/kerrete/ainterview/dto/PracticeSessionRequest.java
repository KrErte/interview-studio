package ee.kerrete.ainterview.dto;

import lombok.Data;

import java.util.List;

@Data
public class PracticeSessionRequest {
    private List<String> blockers;
    private String targetRole;
}
