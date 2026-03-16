package ee.kerrete.ainterview.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ClaudeProperties.class)
public class ClaudeApiConfig {
}
