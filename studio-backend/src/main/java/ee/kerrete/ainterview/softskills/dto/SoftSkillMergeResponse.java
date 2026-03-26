package ee.kerrete.ainterview.softskills.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
@JsonDeserialize(builder = SoftSkillMergeResponse.SoftSkillMergeResponseBuilder.class)
public class SoftSkillMergeResponse {

    SoftSkillMergedProfileDto mergedProfile;
    boolean saved;
    UUID savedProfileId;
    LocalDateTime createdAt;

    @JsonPOJOBuilder(withPrefix = "")
    public static class SoftSkillMergeResponseBuilder {
    }
}
