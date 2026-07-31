package com.arohana.player.web;

import com.arohana.player.application.PlayerService;
import com.arohana.player.application.PlayerSummary;
import com.arohana.shared.security.ArohanaUserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping("/me")
    public ResponseEntity<PlayerSummary> getOwnProfile(
            @AuthenticationPrincipal ArohanaUserPrincipal principal
    ) {
        return ResponseEntity.ok(playerService.getProfile(principal.playerId()));
    }

    @GetMapping("/{username}")
    public ResponseEntity<PlayerSummary> getProfileByUsername(@PathVariable String username) {
        return ResponseEntity.ok(playerService.getProfileByUsername(username));
    }
}
