package ee.kerrete.ainterview.softskills.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonDeserialize(builder = MergedDimensionScore.MergedDimensionScoreBuilder.class)
public class MergedDimensionScore {
    String dimension;
    Double mergedScore;
    Double confidence;
    String rationale;

    @JsonPOJOBuilder(withPrefix = "")
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MergedDimensionScoreBuilder {
    }
}
