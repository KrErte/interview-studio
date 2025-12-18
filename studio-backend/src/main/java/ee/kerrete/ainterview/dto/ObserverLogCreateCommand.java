package ee.kerrete.ainterview.dto;

import ee.kerrete.ainterview.model.ObserverStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObserverLogCreateCommand {
    private UUID sessionUuid;
    private ObserverStage stage;
    private Integer riskBefore;
    private Integer riskAfter;
    private Integer confidenceBefore;
    private Integer confidenceAfter;
    private String signalsJson;
    private String weaknessesJson;
    private String rationaleSummary;
}

