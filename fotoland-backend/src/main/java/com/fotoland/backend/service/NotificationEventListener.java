package com.fotoland.backend.service;

import com.fotoland.backend.config.RabbitMQConfig;
import com.fotoland.backend.event.NotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handle(NotificationEvent event) {
        try {
            notificationService.notifyUser(event.getUsername(), event.getType(), event.getPayload());
        } catch (Exception ex) {
            log.error("Failed to process notification event for {}: {}", event.getUsername(), ex.getMessage(), ex);
            throw ex;
        }
    }
}
