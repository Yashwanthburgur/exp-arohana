package com.arohana.match.application;

import com.arohana.variant.domain.VariantType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateInviteRequest(
        @NotBlank @Size(max = 64) String displayName,
        @NotNull VariantType variant,
        List<String> customPieces,
        boolean timerEnabled,
        int reserveSeconds
) {}
