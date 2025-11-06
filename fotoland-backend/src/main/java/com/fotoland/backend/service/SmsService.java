package com.fotoland.backend.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {
    public void send(String phoneNumber, String message) {
        System.out.println("SMS (stub) para " + phoneNumber + ": " + message);
        // TODO: Integrar Twilio via env (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, FROM_NUMBER)
    }
}