package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

@Value
@Builder
public class VitalSignDto {
    String id;
    String label;
    int value;
    String unit;
    int min;
    int max;
    int optimalMin;
    int optimalMax;
    String trend; // up, down, stable
    List<Integer> history;
}
