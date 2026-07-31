package com.arohana.matchmaking.web;

import com.arohana.match.application.MatchSummary;
import com.arohana.matchmaking.application.JoinQueueRequest;
import com.arohana.matchmaking.application.MatchmakingService;
import com.arohana.shared.security.ArohanaUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    /**
     * POST /api/matchmaking/queue
     * Returns 200 + MatchSummary if instantly paired, or 202 Accepted if queued.
     */
    @PostMapping("/queue")
    public ResponseEntity<?> joinQueue(
            @AuthenticationPrincipal ArohanaUserPrincipal principal,
            @Valid @RequestBody JoinQueueRequest req
    ) {
        Optional<MatchSummary> match = matchmakingService.joinQueue(principal.playerId(), req);
        if (match.isPresent()) {
            return ResponseEntity.ok(match.get());
        }
        return ResponseEntity.accepted().body(Map.of("status", "QUEUED"));
    }

    /**
     * DELETE /api/matchmaking/queue — leave the queue.
     */
    @DeleteMapping("/queue")
    public ResponseEntity<Void> leaveQueue(
            @AuthenticationPrincipal ArohanaUserPrincipal principal
    ) {
        matchmakingService.leaveQueue(principal.playerId());
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/matchmaking/queue/status — check if the caller is currently queued.
     */
    @GetMapping("/queue/status")
    public ResponseEntity<Map<String, Boolean>> queueStatus(
            @AuthenticationPrincipal ArohanaUserPrincipal principal
    ) {
        boolean inQueue = matchmakingService.isInQueue(principal.playerId());
        return ResponseEntity.ok(Map.of("inQueue", inQueue));
    }
}
