package com.arohana.match.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinInviteRequest(@NotBlank @Size(max = 64) String displayName) {}
