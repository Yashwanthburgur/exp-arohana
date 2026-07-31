package com.arohana.match.web;

import com.arohana.match.application.CreateInviteRequest;
import com.arohana.match.application.InviteRoomSummary;
import com.arohana.match.application.JoinInviteRequest;
import com.arohana.match.application.MatchService;
import com.arohana.shared.security.ArohanaUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class InviteRoomController {
    private final MatchService matchService;
    public InviteRoomController(MatchService matchService) { this.matchService = matchService; }

    @PostMapping
    public ResponseEntity<InviteRoomSummary> create(
            @AuthenticationPrincipal ArohanaUserPrincipal principal,
            @Valid @RequestBody CreateInviteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matchService.createInvite(principal == null ? null : principal.playerId(), request));
    }

    @GetMapping("/{roomCode}")
    public InviteRoomSummary get(@PathVariable String roomCode) { return matchService.getInvite(roomCode); }

    @PostMapping("/{roomCode}/join")
    public InviteRoomSummary join(@PathVariable String roomCode,
            @AuthenticationPrincipal ArohanaUserPrincipal principal,
            @Valid @RequestBody JoinInviteRequest request) {
        return matchService.joinInvite(roomCode, principal == null ? null : principal.playerId(), request);
    }
}
