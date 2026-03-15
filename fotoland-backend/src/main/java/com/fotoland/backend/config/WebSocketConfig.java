package com.fotoland.backend.config;

import com.fotoland.backend.websocket.JwtChannelInterceptor;
import com.fotoland.backend.websocket.JwtHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.lang.NonNull;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    public WebSocketConfig(JwtChannelInterceptor jwtChannelInterceptor, JwtHandshakeInterceptor jwtHandshakeInterceptor) {
        this.jwtChannelInterceptor = jwtChannelInterceptor;
        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Endpoint com SockJS (existente)
        registry
            .addEndpoint("/ws")
            .setAllowedOriginPatterns(
                "https://fotoland.onrender.com",
                "https://fotoland-frontend.onrender.com",
                "https://*.onrender.com",
                "http://localhost:*"
            )
            .addInterceptors(jwtHandshakeInterceptor)
            .withSockJS();

        // Endpoint nativo WebSocket (sem SockJS)
        registry
            .addEndpoint("/ws-native")
            .setAllowedOriginPatterns(
                "https://fotoland.onrender.com",
                "https://fotoland-frontend.onrender.com",
                "https://*.onrender.com",
                "http://localhost:*"
            )
            .addInterceptors(jwtHandshakeInterceptor);
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }
}
