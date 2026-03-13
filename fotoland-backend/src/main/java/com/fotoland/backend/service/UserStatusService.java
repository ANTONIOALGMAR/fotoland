package com.fotoland.backend.service;

import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserStatusService {
    // Conjunto thread-safe para armazenar usernames online
    private final Set<String> onlineUsers = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void addUser(String username) {
        onlineUsers.add(username);
    }

    public void removeUser(String username) {
        onlineUsers.remove(username);
    }

    public boolean isOnline(String username) {
        return onlineUsers.contains(username);
    }

    public Set<String> getOnlineUsers() {
        return Collections.unmodifiableSet(onlineUsers);
    }
}
