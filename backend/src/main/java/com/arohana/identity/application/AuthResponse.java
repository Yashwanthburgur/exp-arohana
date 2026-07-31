package com.arohana.identity.application;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID playerId,
        String username,
        String displayName,
        int rating
) {}
