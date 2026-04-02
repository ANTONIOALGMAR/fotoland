package com.fotoland.backend.service;

import com.fotoland.backend.event.NotificationEvent;
import com.fotoland.backend.model.Notification;
import com.fotoland.backend.model.User;
import com.fotoland.backend.repository.NotificationRepository;
import com.fotoland.backend.repository.UserRepository;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
class NotificationEventIntegrationTest {

    @Container
    static RabbitMQContainer rabbitMQ = new RabbitMQContainer("rabbitmq:3-management");

    @Autowired
    private NotificationPublisher publisher;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @DynamicPropertySource
    static void rabbitProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.rabbitmq.host", rabbitMQ::getHost);
        registry.add("spring.rabbitmq.port", () -> rabbitMQ.getMappedPort(5672));
        registry.add("spring.rabbitmq.username", rabbitMQ::getAdminUsername);
        registry.add("spring.rabbitmq.password", rabbitMQ::getAdminPassword);
    }

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();
        User user = new User();
        user.setUsername("alice");
        user.setFullName("Alice Test");
        user.setEmail("alice@example.com");
        user.setPassword("secret");
        user.setRole("USER");
        userRepository.save(user);
    }

    @Test
    void publishingEventResultsInPersistedNotification() {
        publisher.publish(new NotificationEvent(
                "alice",
                Notification.Type.POST_LIKE,
                Map.of("postId", 123, "likerUsername", "bob")
        ));

        Awaitility.await()
                .atMost(Duration.ofSeconds(10))
                .pollInterval(Duration.ofMillis(200))
                .untilAsserted(() -> {
                    assertThat(notificationRepository.findByUser_Username("alice", PageRequest.of(0, 5))
                            .getTotalElements()).isGreaterThan(0);
                });
    }
}
