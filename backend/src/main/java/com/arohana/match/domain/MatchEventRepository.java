package com.arohana.match.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MatchEventRepository extends JpaRepository<MatchEvent, Long> {
    List<MatchEvent> findByMatchIdOrderByTurnAscIdAsc(UUID matchId);

    Optional<MatchEvent> findTopByMatchIdAndEventTypeOrderByIdDesc(UUID matchId, String eventType);
}
