package com.arohana.match.domain;

import com.arohana.variant.domain.VariantType;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "`match`")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "white_player_id")
    private UUID whitePlayerId;

    @Column(name = "black_player_id")
    private UUID blackPlayerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VariantType variant = VariantType.CLASSIC;

    @Column(name = "custom_pieces")
    private String customPieces; // JSON array

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.WAITING;

    @Column(name = "winner_color", length = 5)
    private String winnerColor;

    @Column(name = "white_score", nullable = false)
    private int whiteScore = 0;

    @Column(name = "black_score", nullable = false)
    private int blackScore = 0;

    @Column(name = "timer_enabled", nullable = false)
    private boolean timerEnabled = false;

    @Column(name = "reserve_seconds", nullable = false)
    private int reserveSeconds = 0;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "room_code", unique = true, length = 6)
    private String roomCode;

    @Column(name = "host_name", length = 64)
    private String hostName;

    @Column(name = "guest_name", length = 64)
    private String guestName;

    @Column(name = "host_color", length = 5)
    private String hostColor;

    protected Match() {}

    public static Match create(UUID whitePlayerId, UUID blackPlayerId, VariantType variant) {
        Match m = new Match();
        m.whitePlayerId = whitePlayerId;
        m.blackPlayerId = blackPlayerId;
        m.variant = variant;
        m.status = MatchStatus.DRAFTING;
        m.startedAt = Instant.now();
        return m;
    }

    public static Match createInvite(UUID hostPlayerId, String hostName, String roomCode, VariantType variant, String hostColor) {
        Match m = new Match();
        m.hostColor = hostColor;
        if ("WHITE".equals(hostColor)) {
            m.whitePlayerId = hostPlayerId;
        } else {
            m.blackPlayerId = hostPlayerId;
        }
        m.hostName = hostName;
        m.roomCode = roomCode;
        m.variant = variant;
        m.status = MatchStatus.WAITING;
        return m;
    }

    public void joinInvite(UUID guestPlayerId, String displayName) {
        if ("WHITE".equals(this.hostColor)) {
            this.blackPlayerId = guestPlayerId;
        } else {
            this.whitePlayerId = guestPlayerId;
        }
        this.guestName = displayName;
        this.status = MatchStatus.DRAFTING;
        this.startedAt = Instant.now();
    }

    public void complete(String winnerColor, int whiteScore, int blackScore) {
        this.winnerColor = winnerColor;
        this.whiteScore = whiteScore;
        this.blackScore = blackScore;
        this.status = MatchStatus.COMPLETED;
        this.endedAt = Instant.now();
    }

    // Getters
    public UUID getId() { return id; }
    public UUID getWhitePlayerId() { return whitePlayerId; }
    public UUID getBlackPlayerId() { return blackPlayerId; }
    public VariantType getVariant() { return variant; }
    public String getCustomPieces() { return customPieces; }
    public MatchStatus getStatus() { return status; }
    public String getWinnerColor() { return winnerColor; }
    public int getWhiteScore() { return whiteScore; }
    public int getBlackScore() { return blackScore; }
    public boolean isTimerEnabled() { return timerEnabled; }
    public int getReserveSeconds() { return reserveSeconds; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public String getRoomCode() { return roomCode; }
    public String getHostName() { return hostName; }
    public String getGuestName() { return guestName; }
    public String getHostColor() { return hostColor; }

    // Setters for match configuration
    public void setTimerEnabled(boolean timerEnabled) { this.timerEnabled = timerEnabled; }
    public void setReserveSeconds(int reserveSeconds) { this.reserveSeconds = reserveSeconds; }
    public void setCustomPieces(String customPieces) { this.customPieces = customPieces; }
    public void setStatus(MatchStatus status) { this.status = status; }
    public void setHostColor(String hostColor) { this.hostColor = hostColor; }
}
