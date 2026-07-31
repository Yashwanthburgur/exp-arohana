package com.arohana.player.application;

import com.arohana.player.domain.Player;
import com.arohana.player.domain.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PlayerService {

    private final PlayerRepository playerRepo;

    public PlayerService(PlayerRepository playerRepo) {
        this.playerRepo = playerRepo;
    }

    @Transactional(readOnly = true)
    public PlayerSummary getProfile(UUID playerId) {
        Player p = playerRepo.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));
        return toSummary(p);
    }

    @Transactional(readOnly = true)
    public PlayerSummary getProfileByUsername(String username) {
        Player p = playerRepo.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));
        return toSummary(p);
    }

    private PlayerSummary toSummary(Player p) {
        return new PlayerSummary(p.getId(), p.getUsername(), p.getDisplayName(),
                p.getRating(), p.getWins(), p.getLosses(), p.getDraws());
    }
}
