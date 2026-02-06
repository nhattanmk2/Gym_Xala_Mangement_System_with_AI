package com.xala.gym.controller;

import com.xala.gym.dto.request.LoginRequest;
import com.xala.gym.dto.request.RegisterRequest;
import com.xala.gym.dto.request.VerifyRequest;
import com.xala.gym.dto.response.AuthResponse;
import com.xala.gym.entity.User;
import com.xala.gym.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
//@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/member")
    public ResponseEntity<?> registerMember(
            @RequestBody RegisterRequest request
    ) {
        authService.registerMember(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Đăng ký tài khoản học viên thành công");
    }

    @PostMapping("/register/verify")
    public ResponseEntity<?> verifyAccount(@RequestBody VerifyRequest request) {
        System.out.println("VERIFY REQUEST = " + request.getUsername()
                + " | code=" + request.getVerificationCode());
        authService.verifyAccount(request);
        return ResponseEntity.ok("Xác thực tài khoản thành công");
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
}
