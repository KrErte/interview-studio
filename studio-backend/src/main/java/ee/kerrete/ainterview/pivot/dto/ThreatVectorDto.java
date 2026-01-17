package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ThreatVectorDto {
    String id;
    String label;
    int severity;
    String category; // automation, outsourcing, obsolescence, competition
    String eta;
    String description;
}
