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
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 1. Aplica CORS primeiro
            .csrf(csrf -> csrf.disable()) // Desativa CSRF (usamos JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 2. Define a política de sessão
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Permite preflight OPTIONS
                .requestMatchers("/api/auth/**").permitAll() // Login e registro públicos
                .requestMatchers("/uploads/**").permitAll() // Servir arquivos públicos
                .requestMatchers(HttpMethod.GET, "/api/albums").permitAll() // Feed público
                // 3. Protege as rotas restantes
                .requestMatchers("/api/albums/**", "/api/posts/**", "/api/upload", "/api/comments/**").authenticated()
                .requestMatchers("/api/user/**").hasAuthority("ROLE_USER") // Explicitly grant access to users with ROLE_USER
                .anyRequest().authenticated() // 4. Torna todas as outras rotas seguras por padrão
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class); // 5. Adiciona o filtro JWT


        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration configuration = new CorsConfiguration();
            
            // ✅ Padrões de domínios permitidos (suporta Netlify previews e localhost em várias portas)
            configuration.setAllowedOrigins(List.of(
                "https://fotoland-frontend.onrender.com", // Render frontend
                "http://localhost:4200", // ambiente local padrão
                "http://localhost:4201", // dev server alternativo
                "http://localhost:4202", // dev server alternativo
                "http://localhost:*" // qualquer porta local
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
        // Aumentando a força do BCrypt. O padrão é 10. Valores entre 10 e 12 são recomendados.
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationManager authenticationManager(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
