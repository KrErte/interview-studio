package ee.kerrete.ainterview.dto.dashboard;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class DashboardJobAnalysisDto {
    Long id;
    String jobTitle;
    Double matchScore;
    String summary;
    LocalDateTime createdAt;
}

