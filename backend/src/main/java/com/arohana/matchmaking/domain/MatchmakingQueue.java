package com.arohana.matchmaking.domain;

import com.arohana.variant.domain.VariantType;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "matchmaking_queue")
public class MatchmakingQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "player_id", nullable = false)
    private UUID playerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VariantType variant = VariantType.CLASSIC;

    @Column(nullable = false)
    private int rating;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();

    protected MatchmakingQueue() {}

    public MatchmakingQueue(UUID playerId, VariantType variant, int rating) {
        this.playerId = playerId;
        this.variant = variant;
        this.rating = rating;
    }

    public UUID getId() { return id; }
    public UUID getPlayerId() { return playerId; }
    public VariantType getVariant() { return variant; }
    public int getRating() { return rating; }
    public Instant getJoinedAt() { return joinedAt; }
}
