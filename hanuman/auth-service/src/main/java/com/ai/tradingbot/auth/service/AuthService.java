package com.ai.tradingbot.auth.service;

import com.ai.tradingbot.auth.model.RegisterRequest;
import com.ai.tradingbot.auth.model.LoginRequest;
import com.ai.tradingbot.auth.model.User;
import com.ai.tradingbot.auth.repository.UserRepository;
import com.ai.tradingbot.auth.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    public void register(RegisterRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobile(request.getMobile())
                .build();
        userRepository.save(user);
    }

    public String login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return jwtUtil.generateToken(userOpt.get().getUsername());
        }
        throw new RuntimeException("Invalid username or password");
    }
}
