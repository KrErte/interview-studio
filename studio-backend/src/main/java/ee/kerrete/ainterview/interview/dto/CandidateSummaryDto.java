package ee.kerrete.ainterview.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSummaryDto {
    private String updatedAt;
    private int answeredCount;
    private String narrative;
    private String band; // FOUNDATIONAL, EMERGING, SOLID, STRONG
    private List<String> strengths;
    private List<String> growthAreas;
    private List<SignalDto> signals;
    private List<EvidenceDto> evidenceLast3;
    private String tone; // POSITIVE|NEUTRAL|NEGATIVE
    private String affect; // LOW|MEDIUM|HIGH
    private String affectReason;
    private Integer lastFitScore;
    private String lastFitTrend;
    private Integer deliveryScore; // nullable, only when stylePenaltyEnabled=true

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignalDto {
        private String label;
        private String confidence; // LOW|MEDIUM|HIGH
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvidenceDto {
        private String question;
        private String answerShort;
    }
}


