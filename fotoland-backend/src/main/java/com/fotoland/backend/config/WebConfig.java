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
                .allowedOrigins(
                        "https://sunny-tiramisu-e5bbdc.netlify.app",
                        "https://68fccb9d2f47e9b5e1604501--sunny-tiramisu-e5bbdc.netlify.app",
                        "https://fotoland-frontend.onrender.com"
                    ) // Allow requests from your Netlify frontend and Render frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true); // Allow credentials (e.g., cookies, authorization headers)
    }
}
