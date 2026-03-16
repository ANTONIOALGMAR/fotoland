package com.fotoland.backend.config;

import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSetupConfig {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin1234"));
                admin.setEmail("admin@fotoland.com");
                admin.setFullName("Administrador Geral");
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("✅ Usuário ADMIN criado: admin / admin1234");
            }
        };
    }
}
