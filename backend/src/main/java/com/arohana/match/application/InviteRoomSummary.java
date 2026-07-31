package com.arohana.match.application;

import com.arohana.match.domain.MatchStatus;
import com.arohana.variant.domain.VariantType;
import java.util.List;
import java.util.UUID;

/** Public lobby data. Deliberately excludes player identifiers. */
public record InviteRoomSummary(
        UUID matchId,
        String roomCode,
        MatchStatus status,
        String hostName,
        String guestName,
        VariantType variant,
        List<String> customPieces,
        boolean timerEnabled,
        int reserveSeconds,
        String assignedColor,
        String hostColor
) {}
