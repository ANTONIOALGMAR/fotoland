package com.fotoland.backend.service;

import com.fotoland.backend.event.NotificationEvent;
import com.fotoland.backend.model.Notification;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class NotificationEventListenerTest {

    private NotificationService notificationService;
    private NotificationEventListener listener;

    @BeforeEach
    void setUp() {
        notificationService = mock(NotificationService.class);
        listener = new NotificationEventListener(notificationService);
    }

    @Test
    void handleShouldDelegateToNotificationService() {
        NotificationEvent event = new NotificationEvent(
                "alice",
                Notification.Type.POST_LIKE,
                Map.of("postId", 42, "likerUsername", "bob")
        );

        listener.handle(event);

        ArgumentCaptor<String> usernameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Notification.Type> typeCaptor = ArgumentCaptor.forClass(Notification.Type.class);
        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);

        verify(notificationService).notifyUser(
                usernameCaptor.capture(),
                typeCaptor.capture(),
                payloadCaptor.capture()
        );

        assertThat(usernameCaptor.getValue()).isEqualTo("alice");
        assertThat(typeCaptor.getValue()).isEqualTo(Notification.Type.POST_LIKE);
        assertThat(payloadCaptor.getValue()).containsEntry("postId", 42);
        assertThat(payloadCaptor.getValue()).containsEntry("likerUsername", "bob");
    }
}
