package com.fotoland.backend.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.binder.MeterBinder;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class MetricsConfig {

    @Bean
    public MeterBinder rabbitConnectionsBinder(CachingConnectionFactory connectionFactory) {
        return registry -> {
            Tag tag = Tag.of("component", "rabbitmq");
            registry.gauge("rabbitmq.connection.cache", List.of(tag), connectionFactory,
                    CachingConnectionFactory::getConnectionCacheSize);
            registry.gauge("rabbitmq.channel.cache", List.of(tag), connectionFactory,
                    CachingConnectionFactory::getChannelCacheSize);
        };
    }
}
