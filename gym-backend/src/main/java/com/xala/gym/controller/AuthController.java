package com.xala.gym.controller;

import com.xala.gym.dto.request.LoginRequest;
import com.xala.gym.dto.request.RegisterRequest;
import com.xala.gym.dto.response.AuthResponse;
import com.xala.gym.entity.User;
import com.xala.gym.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {
        User user = authService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
}
