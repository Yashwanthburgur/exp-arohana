package com.arohana.match.web;

import com.arohana.match.application.CreateMatchRequest;
import com.arohana.match.application.MatchService;
import com.arohana.match.application.MatchSummary;
import com.arohana.match.domain.MatchEvent;
import com.arohana.shared.security.ArohanaUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping
    public ResponseEntity<MatchSummary> createMatch(
            @AuthenticationPrincipal ArohanaUserPrincipal principal,
            @Valid @RequestBody CreateMatchRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matchService.createMatch(principal.playerId(), req));
    }

    @GetMapping("/{matchId}")
    public ResponseEntity<MatchSummary> getMatch(@PathVariable UUID matchId) {
        return ResponseEntity.ok(matchService.getMatch(matchId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<MatchSummary>> getMyMatches(
            @AuthenticationPrincipal ArohanaUserPrincipal principal
    ) {
        return ResponseEntity.ok(matchService.getPlayerMatches(principal.playerId()));
    }

    @GetMapping("/{matchId}/events")
    public ResponseEntity<List<MatchEvent>> getMatchEvents(@PathVariable UUID matchId) {
        return ResponseEntity.ok(matchService.getMatchEvents(matchId));
    }
}
