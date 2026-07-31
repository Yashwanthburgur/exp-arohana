package com.arohana.player.application;

import java.util.UUID;

public record PlayerSummary(
        UUID id,
        String username,
        String displayName,
        int rating,
        int wins,
        int losses,
        int draws
) {}
