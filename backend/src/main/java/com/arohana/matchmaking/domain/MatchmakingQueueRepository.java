package com.arohana.matchmaking.domain;

import com.arohana.variant.domain.VariantType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MatchmakingQueueRepository extends JpaRepository<MatchmakingQueue, UUID> {

    Optional<MatchmakingQueue> findByPlayerId(UUID playerId);

    boolean existsByPlayerId(UUID playerId);

    void deleteByPlayerId(UUID playerId);

    /**
     * Find candidates in the same variant whose rating is within [minRating, maxRating],
     * ordered by join time (FIFO fair pairing).
     */
    @Query("SELECT q FROM MatchmakingQueue q WHERE q.variant = :variant " +
           "AND q.rating >= :minRating AND q.rating <= :maxRating " +
           "AND q.playerId <> :excludePlayerId " +
           "ORDER BY q.joinedAt ASC")
    List<MatchmakingQueue> findCandidates(
            VariantType variant,
            int minRating,
            int maxRating,
            UUID excludePlayerId
    );
}
