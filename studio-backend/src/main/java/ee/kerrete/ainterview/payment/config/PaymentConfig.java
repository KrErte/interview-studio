package ee.kerrete.ainterview.payment.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StripeProperties.class)
public class PaymentConfig {

    private final StripeProperties stripeProperties;

    public PaymentConfig(StripeProperties stripeProperties) {
        this.stripeProperties = stripeProperties;
    }

    @PostConstruct
    public void initStripe() {
        Stripe.apiKey = stripeProperties.secretKey();
    }
}
