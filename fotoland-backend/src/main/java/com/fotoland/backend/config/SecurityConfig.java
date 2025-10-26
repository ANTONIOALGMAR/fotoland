package com.fotoland.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fotoland.backend.filter.JwtRequestFilter;
import com.fotoland.backend.service.UserDetailsServiceImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter, UserDetailsServiceImpl userDetailsService) {
        this.jwtRequestFilter = jwtRequestFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desativa CSRF (usamos JWT)
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS centralizado
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Permite preflight OPTIONS
                .requestMatchers("/api/upload").permitAll() // Permite upload explicitamente
                .requestMatchers("/api/**").permitAll() // Permite outras APIs
                .anyRequest().permitAll() // Permite tudo temporariamente
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration configuration = new CorsConfiguration();
            
            // ✅ Padrões de domínios permitidos (suporta Netlify previews)
            configuration.setAllowedOriginPatterns(List.of(
                "https://*.netlify.app", // Netlify (prod e previews)
                "https://fotoland-frontend.onrender.com", // alternativa Render
                "http://localhost:4200" // ambiente local
            ));
            
            // ✅ Métodos e cabeçalhos permitidos
            configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(List.of("*"));
            configuration.setExposedHeaders(List.of("Authorization")); // expõe cabeçalhos necessários no frontend
            configuration.setAllowCredentials(true); // permite envio de credenciais (tokens, cookies)
            configuration.setMaxAge(3600L); // cache do preflight por 1h

            return configuration;
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
