package com.arohana.matchmaking.application;

import com.arohana.variant.domain.VariantType;
import jakarta.validation.constraints.NotNull;

public record JoinQueueRequest(
        @NotNull VariantType variant
) {}
