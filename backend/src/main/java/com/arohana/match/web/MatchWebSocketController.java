package com.arohana.match.web;

import com.arohana.match.application.MatchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class MatchWebSocketController {
    private final SimpMessagingTemplate broker;
    private final MatchService matchService;
    private final ObjectMapper objectMapper;

    public MatchWebSocketController(SimpMessagingTemplate broker, MatchService matchService, ObjectMapper objectMapper) {
        this.broker = broker;
        this.matchService = matchService;
        this.objectMapper = objectMapper;
    }

    @MessageMapping("/match/{matchId}/action")
    public void handleAction(@DestinationVariable String matchId, @Payload MatchMessage message) {
        UUID parsedMatchId = UUID.fromString(matchId);
        if (message.matchId() != null && !matchId.equals(message.matchId())) {
            throw new IllegalArgumentException("Match id does not match destination");
        }

        // The simple broker does not retain topic messages. Replaying the
        // newest persisted snapshot prevents a late subscriber from starting
        // an isolated local game.
        if ("SYNC_REQUEST".equals(message.type())) {
            matchService.getLatestSnapshot(parsedMatchId).ifPresent(event -> {
                try {
                    broker.convertAndSend("/topic/match/" + matchId, new MatchMessage(
                            1, "SNAPSHOT", matchId, event.getActorColor(),
                            "replay-" + event.getId(), (long) event.getTurn(), null,
                            objectMapper.readTree(event.getPayload())));
                } catch (Exception ignored) {
                    // Ignore corrupt historic data; it must not break a live room.
                }
            });
            return;
        }

        // `sequence` is a client-side idempotency/order value and may be a
        // millisecond timestamp. It is not the legacy integer turn column.
        // Converting Date.now() with Math.toIntExact used to throw before the
        // broker broadcast, leaving two apparently connected clients isolated.
        matchService.recordEvent(parsedMatchId, 0,
                message.type(), message.actorColor(),
                message.payload() != null ? message.payload().toString() : "{}");
        broker.convertAndSend("/topic/match/" + matchId, message);
    }
}
