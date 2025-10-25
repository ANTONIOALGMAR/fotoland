package com.fotoland.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry; // Import CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/"); // Serve files from the 'uploads' directory
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) { // Add this method
        registry.addMapping("/**") // Apply CORS to all endpoints
                .allowedOriginPatterns(
                        "https://*.netlify.app",
                        "https://fotoland-frontend.onrender.com",
                        "http://localhost:4200"
                    ) // Allow Netlify previews, Render frontend, and local dev
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true); // Allow credentials (e.g., cookies, authorization headers)
    }
}
