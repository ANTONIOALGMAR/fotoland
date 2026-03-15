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
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public static final String JWT_COOKIE_NAME = "fotoland_jwt";
    private static final Duration JWT_COOKIE_MAX_AGE = Duration.ofHours(10);

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
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
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

            // Emite cookie JWT para já considerar o usuário autenticado após o cadastro.
            UserDetails userDetails = userDetailsService.loadUserByUsername(registeredUser.getUsername());
            String jwt = jwtUtil.generateToken(userDetails);
            ResponseCookie cookie = buildJwtCookie(request, jwt);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(com.fotoland.backend.dto.UserResponse.from(registeredUser));
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@Valid @RequestBody AuthenticationRequest authenticationRequest, HttpServletRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>("Incorrect username or password", HttpStatus.UNAUTHORIZED);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        ResponseCookie cookie = buildJwtCookie(request, jwt);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                // Nao expor JWT no body reduz superficie para XSS.
                .body(new AuthenticationResponse(null));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        ResponseCookie cookie = clearJwtCookie(request);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }

    private ResponseCookie buildJwtCookie(HttpServletRequest request, String jwt) {
        boolean secure = isSecureRequest(request);
        String sameSite = secure ? "None" : "Lax";

        return ResponseCookie.from(JWT_COOKIE_NAME, jwt)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite(sameSite)
                .maxAge(JWT_COOKIE_MAX_AGE)
                .build();
    }

    private ResponseCookie clearJwtCookie(HttpServletRequest request) {
        boolean secure = isSecureRequest(request);
        String sameSite = secure ? "None" : "Lax";
        return ResponseCookie.from(JWT_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite(sameSite)
                .maxAge(Duration.ZERO)
                .build();
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        if (forwardedProto != null) {
            return forwardedProto.equalsIgnoreCase("https");
        }
        return request.isSecure();
    }
}
