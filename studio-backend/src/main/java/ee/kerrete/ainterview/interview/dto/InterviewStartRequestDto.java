package ee.kerrete.ainterview.interview.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import ee.kerrete.ainterview.interview.enums.InterviewerStyle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@JsonDeserialize(builder = InterviewStartRequestDto.InterviewStartRequestDtoBuilder.class)
public class InterviewStartRequestDto {
    String candidateEmail;
    @NotBlank
    String companyName;
    @NotBlank
    String roleTitle;
    @NotBlank
    String seniority;
    @NotNull
    InterviewerStyle interviewerStyle;

    @JsonPOJOBuilder(withPrefix = "")
    public static class InterviewStartRequestDtoBuilder {
    }
}
