package ee.kerrete.ainterview.session.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SaveByEmailRequest {
    @NotBlank
    @Email
    private String email;
}
