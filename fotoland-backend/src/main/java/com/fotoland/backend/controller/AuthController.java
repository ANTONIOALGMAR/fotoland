package com.fotoland.backend.controller;

import com.fotoland.backend.dto.AuthenticationRequest;
import com.fotoland.backend.dto.AuthenticationResponse;
import com.fotoland.backend.dto.RegisterRequest;
import com.fotoland.backend.model.User;
import com.fotoland.backend.service.UserDetailsServiceImpl;
import com.fotoland.backend.service.UserService;
import com.fotoland.backend.util.JwtUtil;
import com.fotoland.backend.service.EmailService;
import com.fotoland.backend.service.SmsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final SmsService smsService;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, UserDetailsServiceImpl userDetailsService, JwtUtil jwtUtil, EmailService emailService, SmsService smsService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.smsService = smsService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(registerRequest.getPassword());
            user.setFullName(registerRequest.getFullName());
            user.setPhoneNumber(registerRequest.getPhoneNumber());

            User registeredUser = userService.registerNewUser(user);
            emailService.send(registeredUser.getEmail(), "Bem-vindo ao Fotoland", "Sua conta foi criada com sucesso!");
            if (registeredUser.getPhoneNumber() != null && !registeredUser.getPhoneNumber().isBlank()) {
                smsService.send(registeredUser.getPhoneNumber(), "Bem-vindo ao Fotoland! Sua conta foi criada.");
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(com.fotoland.backend.dto.UserResponse.from(registeredUser));
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@Valid @RequestBody AuthenticationRequest authenticationRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>("Incorrect username or password", HttpStatus.UNAUTHORIZED);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }
}
