package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

@Value
@Builder
public class AIMilestoneDto {
    int year;
    String capability;
    String description;
    String impact; // low, medium, high, critical
    int probability;
    String status; // past, imminent, projected
    List<String> affectedTasks;
}
