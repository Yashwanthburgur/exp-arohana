package com.arohana.match.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, UUID> {

    @Query("SELECT m FROM Match m WHERE m.whitePlayerId = :playerId OR m.blackPlayerId = :playerId ORDER BY m.createdAt DESC")
    List<Match> findByPlayerId(UUID playerId);

    List<Match> findByStatus(MatchStatus status);

    Optional<Match> findByRoomCode(String roomCode);

    boolean existsByRoomCode(String roomCode);
}
