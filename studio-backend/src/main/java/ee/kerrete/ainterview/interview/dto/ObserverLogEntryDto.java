package ee.kerrete.ainterview.interview.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ObserverLogEntryDto {
    String id;
    String ts;
    String message;
    String decision;
    String reason;
    String dimension;
    String style;
    String questionId;
    String payloadJson;
}

