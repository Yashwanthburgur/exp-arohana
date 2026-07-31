package com.arohana.match.application;

import com.arohana.match.domain.MatchStatus;
import com.arohana.variant.domain.VariantType;
import java.time.Instant;
import java.util.UUID;

public record MatchSummary(
        UUID id,
        UUID whitePlayerId,
        UUID blackPlayerId,
        VariantType variant,
        MatchStatus status,
        String winnerColor,
        int whiteScore,
        int blackScore,
        boolean timerEnabled,
        int reserveSeconds,
        Instant startedAt,
        Instant endedAt,
        Instant createdAt
) {}
