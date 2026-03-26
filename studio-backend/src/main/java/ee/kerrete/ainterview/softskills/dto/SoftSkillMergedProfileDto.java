package ee.kerrete.ainterview.softskills.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import lombok.Builder;
import lombok.Value;
import lombok.With;

import java.util.List;

@Value
@Builder
@With
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonDeserialize(builder = SoftSkillMergedProfileDto.SoftSkillMergedProfileDtoBuilder.class)
public class SoftSkillMergedProfileDto {

    @Builder.Default
    String summary = "No summary provided.";
    @Builder.Default
    List<String> strengths = List.of();
    @Builder.Default
    List<String> risks = List.of();
    @Builder.Default
    String communicationStyle = "Not provided";
    @Builder.Default
    String collaborationStyle = "Not provided";
    @Builder.Default
    List<String> growthAreas = List.of();
    @Builder.Default
    List<MergedDimensionScore> dimensionScoresMerged = List.of();
    Meta meta;

    @JsonPOJOBuilder(withPrefix = "")
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SoftSkillMergedProfileDtoBuilder {
    }
}
