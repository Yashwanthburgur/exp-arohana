package com.arohana.matchmaking.application;

import com.arohana.match.application.MatchService;
import com.arohana.match.application.MatchSummary;
import com.arohana.match.application.CreateMatchRequest;
import com.arohana.matchmaking.domain.MatchmakingQueue;
import com.arohana.matchmaking.domain.MatchmakingQueueRepository;
import com.arohana.player.domain.Player;
import com.arohana.player.domain.PlayerRepository;
import com.arohana.variant.domain.VariantType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MatchmakingService {

    /** ELO rating band for pairing. Widens over time in a future iteration. */
    private static final int RATING_BAND = 200;

    private final MatchmakingQueueRepository queueRepo;
    private final PlayerRepository playerRepo;
    private final MatchService matchService;
    private final SimpMessagingTemplate broker;

    public MatchmakingService(
            MatchmakingQueueRepository queueRepo,
            PlayerRepository playerRepo,
            MatchService matchService,
            SimpMessagingTemplate broker
    ) {
        this.queueRepo = queueRepo;
        this.playerRepo = playerRepo;
        this.matchService = matchService;
        this.broker = broker;
    }

    /**
     * Attempt to join the queue. If a compatible opponent is already waiting,
     * create a match immediately and notify both players via WebSocket.
     *
     * @return Optional&lt;MatchSummary&gt; — present if a match was created, empty if queued.
     */
    @Transactional
    public Optional<MatchSummary> joinQueue(UUID playerId, JoinQueueRequest req) {
        if (queueRepo.existsByPlayerId(playerId)) {
            throw new IllegalStateException("Already in queue");
        }

        Player player = playerRepo.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        int rating = player.getRating();
        List<MatchmakingQueue> candidates = queueRepo.findCandidates(
                req.variant(), rating - RATING_BAND, rating + RATING_BAND, playerId);

        if (!candidates.isEmpty()) {
            MatchmakingQueue opponent = candidates.get(0);
            queueRepo.delete(opponent);

            // Randomly assign colors
            UUID whiteId = Math.random() < 0.5 ? playerId : opponent.getPlayerId();
            UUID blackId = whiteId.equals(playerId) ? opponent.getPlayerId() : playerId;

            CreateMatchRequest matchReq = new CreateMatchRequest(blackId, req.variant(), null, false, 0);
            MatchSummary match = matchService.createMatch(whiteId, matchReq);

            // Notify both players
            broker.convertAndSendToUser(playerId.toString(), "/queue/matched", match);
            broker.convertAndSendToUser(opponent.getPlayerId().toString(), "/queue/matched", match);

            return Optional.of(match);
        }

        // No opponent found — add to queue
        queueRepo.save(new MatchmakingQueue(playerId, req.variant(), rating));
        return Optional.empty();
    }

    @Transactional
    public void leaveQueue(UUID playerId) {
        queueRepo.deleteByPlayerId(playerId);
    }

    @Transactional(readOnly = true)
    public boolean isInQueue(UUID playerId) {
        return queueRepo.existsByPlayerId(playerId);
    }
}
