package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;
import java.util.List;

@Value
@Builder
public class DisruptedRoleDto {
    String title;
    int peakYear;
    String currentStatus; // disrupted, transformed, declining
    String peakEmployment;
    String currentEmployment;
    int decline;
    List<String> disruptors;
    List<TimelineEventDto> timeline;
    List<String> survivors;
    List<String> lessons;

    @Value
    @Builder
    public static class TimelineEventDto {
        int year;
        String event;
    }
}
