package com.hanuman.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.hanuman.auth.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Object loginRequest) {
        // Implement login logic using authService
        return ResponseEntity.ok().body("Login endpoint (implement logic)");
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Object signupRequest) {
        // Implement signup logic using authService
        return ResponseEntity.ok().body("Signup endpoint (implement logic)");
    }
}
