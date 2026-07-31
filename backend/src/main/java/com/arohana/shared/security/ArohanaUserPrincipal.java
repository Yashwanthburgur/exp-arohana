package com.arohana.shared.security;

import java.util.UUID;

public record ArohanaUserPrincipal(UUID playerId, String username) {}
