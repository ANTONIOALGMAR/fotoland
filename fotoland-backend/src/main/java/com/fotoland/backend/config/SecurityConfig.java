package com.fotoland.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fotoland.backend.filter.ApiCsrfFilter;
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

    private final ApiCsrfFilter apiCsrfFilter;
    private final JwtRequestFilter jwtRequestFilter;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(ApiCsrfFilter apiCsrfFilter, JwtRequestFilter jwtRequestFilter, UserDetailsServiceImpl userDetailsService) {
        this.apiCsrfFilter = apiCsrfFilter;
        this.jwtRequestFilter = jwtRequestFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers("/api/search/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/albums").permitAll()
                .requestMatchers("/api/upload/**", "/api/albums/**", "/api/posts/**", "/api/comments/**").authenticated()
                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/chat/**").authenticated()
                .requestMatchers("/ws/**", "/ws-native/**").permitAll()
                .requestMatchers("/actuator/prometheus", "/actuator/health", "/actuator/info").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(apiCsrfFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration configuration = new CorsConfiguration();

            configuration.setAllowedOrigins(List.of(
                "https://fotoland-frontend.onrender.com",
                "https://fotoland-frontend-v2.onrender.com", // Adicionando variante
                "https://fotoland-frontend.vercel.app",
                "https://fotoland.onrender.com",
                "http://localhost:4200",
                "http://localhost:8080"
            ));

            configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
            configuration.setAllowedHeaders(List.of("*")); // Permitir todos os headers para evitar bloqueios
            configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));
            configuration.setAllowCredentials(true);
            configuration.setMaxAge(3600L);

            return configuration;
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Aumentando a força do BCrypt.
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
