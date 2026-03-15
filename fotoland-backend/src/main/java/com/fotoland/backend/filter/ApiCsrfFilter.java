package com.fotoland.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class ApiCsrfFilter extends OncePerRequestFilter {
    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS", "TRACE");

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        if (!SAFE_METHODS.contains(request.getMethod())
                && request.getServletPath() != null
                && request.getServletPath().startsWith("/api/")
                && !request.getServletPath().startsWith("/api/auth/")) {
            // Protecao simples anti-CSRF: exige header que forms nao conseguem setar.
            String requestedWith = request.getHeader("X-Requested-With");
            if (requestedWith == null || !requestedWith.equalsIgnoreCase("XMLHttpRequest")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"CSRF protection: missing X-Requested-With\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}

