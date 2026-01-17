package ee.kerrete.ainterview.pivot.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MarketSignalDto {
    String id;
    String type; // opportunity, warning, trend, layoff
    String title;
    String source;
    String timeAgo;
    int relevanceScore;
    String details;
    boolean actionable;
    String action;
}
