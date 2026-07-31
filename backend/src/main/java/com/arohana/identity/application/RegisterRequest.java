package com.arohana.identity.application;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 32)
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username may only contain letters, numbers and underscores")
        String username,

        @NotBlank @Size(min = 1, max = 64)
        String displayName,

        @Email @NotBlank
        String email,

        @NotBlank @Size(min = 8, max = 72)
        String password
) {}
