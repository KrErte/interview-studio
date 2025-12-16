package ee.kerrete.ainterview.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class AiHealthStatusDto {
    boolean ok;
    String service;
    Instant ts;

    Boolean aiOk;          // null when deep check not executed
    Long aiLatencyMs;      // only for deep=true
    String modelUsed;      // model name used for deep ping
    String errorSummary;   // short error summary when aiOk=false
}

