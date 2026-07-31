package com.arohana.match.application;

import com.arohana.match.domain.Match;
import com.arohana.match.domain.MatchEvent;
import com.arohana.match.domain.MatchEventRepository;
import com.arohana.match.domain.MatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.security.SecureRandom;
import java.util.UUID;
import java.util.Optional;

@Service
public class MatchService {

    private final MatchRepository matchRepo;
    private final MatchEventRepository eventRepo;

    public MatchService(MatchRepository matchRepo, MatchEventRepository eventRepo) {
        this.matchRepo = matchRepo;
        this.eventRepo = eventRepo;
    }

    @Transactional
    public MatchSummary createMatch(UUID whitePlayerId, CreateMatchRequest req) {
        Match match = Match.create(whitePlayerId, req.opponentId(), req.variant());
        match.setTimerEnabled(req.timerEnabled());
        match.setReserveSeconds(req.reserveSeconds());

        if (req.customPieces() != null && !req.customPieces().isEmpty()) {
            // Store as JSON array string
            match.setCustomPieces(req.customPieces().toString());
        }

        Match saved = matchRepo.save(match);
        return toSummary(saved);
    }

    @Transactional
    public InviteRoomSummary createInvite(UUID hostPlayerId, CreateInviteRequest req) {
        String code = nextRoomCode();
        String hostColor = Math.random() < 0.5 ? "WHITE" : "BLACK";
        Match match = Match.createInvite(hostPlayerId, req.displayName().trim(), code, req.variant(), hostColor);
        match.setTimerEnabled(req.timerEnabled());
        match.setReserveSeconds(Math.max(0, req.reserveSeconds()));
        if (req.customPieces() != null && !req.customPieces().isEmpty()) {
            match.setCustomPieces(String.join(",", req.customPieces()));
        }
        return toInviteSummary(matchRepo.save(match), hostColor);
    }

    @Transactional
    public InviteRoomSummary joinInvite(String rawCode, UUID guestPlayerId, JoinInviteRequest req) {
        Match match = matchRepo.findByRoomCode(normalizeRoomCode(rawCode))
                .orElseThrow(() -> new IllegalArgumentException("Room code not found"));
        if (match.getStatus() != com.arohana.match.domain.MatchStatus.WAITING) {
            throw new IllegalStateException("This room is no longer available");
        }
        match.joinInvite(guestPlayerId, req.displayName().trim());
        String guestColor = "WHITE".equals(match.getHostColor()) ? "BLACK" : "WHITE";
        return toInviteSummary(match, guestColor);
    }

    @Transactional(readOnly = true)
    public InviteRoomSummary getInvite(String rawCode) {
        Match match = matchRepo.findByRoomCode(normalizeRoomCode(rawCode))
                .orElseThrow(() -> new IllegalArgumentException("Room code not found"));
        return toInviteSummary(match, null);
    }

    @Transactional(readOnly = true)
    public MatchSummary getMatch(UUID matchId) {
        Match m = matchRepo.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));
        return toSummary(m);
    }

    @Transactional(readOnly = true)
    public List<MatchSummary> getPlayerMatches(UUID playerId) {
        return matchRepo.findByPlayerId(playerId).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchEvent> getMatchEvents(UUID matchId) {
        return eventRepo.findByMatchIdOrderByTurnAscIdAsc(matchId);
    }

    @Transactional(readOnly = true)
    public Optional<MatchEvent> getLatestSnapshot(UUID matchId) {
        return eventRepo.findTopByMatchIdAndEventTypeOrderByIdDesc(matchId, "SNAPSHOT");
    }

    @Transactional
    public void recordEvent(UUID matchId, int turn, String eventType, String actorColor, String payload) {
        eventRepo.save(new MatchEvent(matchId, turn, eventType, actorColor, payload));
    }

    private MatchSummary toSummary(Match m) {
        return new MatchSummary(
                m.getId(), m.getWhitePlayerId(), m.getBlackPlayerId(),
                m.getVariant(), m.getStatus(), m.getWinnerColor(),
                m.getWhiteScore(), m.getBlackScore(),
                m.isTimerEnabled(), m.getReserveSeconds(),
                m.getStartedAt(), m.getEndedAt(), m.getCreatedAt()
        );
    }

    private InviteRoomSummary toInviteSummary(Match m, String assignedColor) {
        List<String> customPieces = m.getCustomPieces() == null || m.getCustomPieces().isBlank()
                ? List.of() : List.of(m.getCustomPieces().split(","));
        return new InviteRoomSummary(m.getId(), m.getRoomCode(), m.getStatus(), m.getHostName(),
                m.getGuestName(), m.getVariant(), customPieces, m.isTimerEnabled(),
                m.getReserveSeconds(), assignedColor, m.getHostColor());
    }

    private String nextRoomCode() {
        final String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        SecureRandom random = new SecureRandom();
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder result = new StringBuilder(6);
            for (int i = 0; i < 6; i++) result.append(alphabet.charAt(random.nextInt(alphabet.length())));
            String code = result.toString();
            if (!matchRepo.existsByRoomCode(code)) return code;
        }
        throw new IllegalStateException("Could not allocate an invite code");
    }

    private String normalizeRoomCode(String code) {
        return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
    }
}
