package ee.kerrete.ainterview.payment.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(LemonSqueezyProperties.class)
public class PaymentConfig {
}
