package ee.kerrete.ainterview;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "ee.kerrete.ainterview")
@ConfigurationPropertiesScan
@EnableScheduling
public class AiInterviewBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiInterviewBackendApplication.class, args);
    }
}
