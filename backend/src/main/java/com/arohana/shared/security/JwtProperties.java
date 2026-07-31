package com.arohana.shared.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "arohana.jwt")
public record JwtProperties(String secret, int expiryHours) {}
