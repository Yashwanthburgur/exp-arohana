package com.arohana.identity.application;

import com.arohana.identity.domain.Identity;
import com.arohana.identity.domain.IdentityRepository;
import com.arohana.player.domain.Player;
import com.arohana.player.domain.PlayerRepository;
import com.arohana.shared.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final PlayerRepository playerRepo;
    private final IdentityRepository identityRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            PlayerRepository playerRepo,
            IdentityRepository identityRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.playerRepo = playerRepo;
        this.identityRepo = identityRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (playerRepo.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (identityRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Player player = playerRepo.save(new Player(req.username(), req.displayName()));
        String hash = passwordEncoder.encode(req.password());
        identityRepo.save(new Identity(player.getId(), req.email(), hash));

        String token = jwtService.generate(player.getId(), player.getUsername());
        return new AuthResponse(token, player.getId(), player.getUsername(), player.getDisplayName(), player.getRating());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Identity identity = identityRepo.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), identity.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        Player player = playerRepo.findById(identity.getPlayerId())
                .orElseThrow(() -> new IllegalStateException("Player not found for identity"));

        String token = jwtService.generate(player.getId(), player.getUsername());
        return new AuthResponse(token, player.getId(), player.getUsername(), player.getDisplayName(), player.getRating());
    }
}
