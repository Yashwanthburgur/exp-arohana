package com.arohana.match.application;

import com.arohana.variant.domain.VariantType;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record CreateMatchRequest(
        @NotNull UUID opponentId,
        @NotNull VariantType variant,
        List<String> customPieces,
        boolean timerEnabled,
        int reserveSeconds
) {}
