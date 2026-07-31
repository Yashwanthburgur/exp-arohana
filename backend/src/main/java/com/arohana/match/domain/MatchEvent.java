package com.arohana.match.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "match_event")
public class MatchEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_id", nullable = false)
    private UUID matchId;

    @Column(nullable = false)
    private int turn;

    @Column(name = "event_type", nullable = false, length = 40)
    private String eventType;

    @Column(name = "actor_color", nullable = false, length = 5)
    private String actorColor;

    @Column(nullable = false, columnDefinition = "json")
    private String payload;


    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected MatchEvent() {}

    public MatchEvent(UUID matchId, int turn, String eventType, String actorColor, String payload) {
        this.matchId = matchId;
        this.turn = turn;
        this.eventType = eventType;
        this.actorColor = actorColor;
        this.payload = payload;
    }

    public Long getId() { return id; }
    public UUID getMatchId() { return matchId; }
    public int getTurn() { return turn; }
    public String getEventType() { return eventType; }
    public String getActorColor() { return actorColor; }
    public String getPayload() { return payload; }
    public Instant getCreatedAt() { return createdAt; }
}
