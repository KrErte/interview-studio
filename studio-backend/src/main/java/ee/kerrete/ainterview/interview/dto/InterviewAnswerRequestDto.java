package ee.kerrete.ainterview.interview.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
@JsonDeserialize(builder = InterviewAnswerRequestDto.InterviewAnswerRequestDtoBuilder.class)
public class InterviewAnswerRequestDto {
    @NotNull
    UUID sessionId;
    @NotNull
    Integer questionNumber;
    @NotBlank
    String answer;

    @JsonPOJOBuilder(withPrefix = "")
    public static class InterviewAnswerRequestDtoBuilder {
    }
}
