package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MarketMetricDto {
    String label;
    String value;
    int change;
    String trend; // up, down, stable
}
