package ee.kerrete.ainterview.dto;

import ee.kerrete.ainterview.model.ObserverStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObserverLogDto {
    private UUID id;
    private UUID sessionUuid;
    private OffsetDateTime createdAt;
    private ObserverStage stage;
    private Integer riskBefore;
    private Integer riskAfter;
    private Integer confidenceBefore;
    private Integer confidenceAfter;
    private String signalsJson;
    private String weaknessesJson;
    private String rationaleSummary;

    @JsonProperty("sessionId")
    public String getSessionId() {
        return sessionUuid == null ? null : sessionUuid.toString();
    }
}

