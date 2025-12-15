package ee.kerrete.ainterview.interview.dto;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class InterviewAuditEventDto {
    String id;
    String ts;
    String type;
    Map<String, Object> payload;
}


