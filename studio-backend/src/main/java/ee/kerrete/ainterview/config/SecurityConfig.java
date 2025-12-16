package ee.kerrete.ainterview.config;

import ee.kerrete.ainterview.auth.handler.AccessDeniedHandlerImpl;
import ee.kerrete.ainterview.auth.handler.AuthenticationEntryPointImpl;
import ee.kerrete.ainterview.auth.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration.
 * Configures JWT-based stateless authentication + robust CORS for dev.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationEntryPointImpl authEntryPoint;
    private final AccessDeniedHandlerImpl accessDeniedHandler;
    private final UserDetailsService userDetailsService;

    private static final String[] PUBLIC_ENDPOINTS = {
        "/api/auth/**",
        "/actuator/**",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/error"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   AuthenticationProvider authenticationProvider,
                                                   Environment environment) throws Exception {
        boolean isLocalProfile = environment.acceptsProfiles(Profiles.of("local"));

        http
            // IMPORTANT: enables CORS processing inside the Spring Security chain
            .cors(Customizer.withDefaults())

            .csrf(csrf -> csrf.disable())

            .headers(headers -> {
                if (isLocalProfile) {
                    // Local-only: H2 console requires frames
                    headers.frameOptions(frame -> frame.sameOrigin());
                }
            })

            .authorizeHttpRequests(auth -> {
                // Preflight must always be allowed
                auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                if (isLocalProfile) {
                    auth.requestMatchers("/h2-console/**").permitAll();
                }

                auth
                    .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/trainer/status").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/risk/**").permitAll()
                    .requestMatchers("/api/candidate/**").authenticated()
                    .requestMatchers("/api/studio/**").authenticated()
                    .requestMatchers("/api/risk/**").authenticated()
                    .anyRequest().authenticated();
            })

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authenticationProvider(authenticationProvider)

            // IMPORTANT: ensure JWT filter does not break preflight (OPTIONS)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS configuration for local dev (Angular on http://localhost:4200 / 4202 / 4203).
     *
     * NOTE:
     * - allowCredentials=true => cannot use allowedOrigins="*"
     * - We use allowedOriginPatterns to be resilient (localhost / 127.0.0.1 + any port).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",
            "http://localhost:4202",
            "http://localhost:4203",
            "http://127.0.0.1:4200",
            "http://127.0.0.1:4202",
            "http://127.0.0.1:4203"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply to everything, including /error
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
