package com.arohana.match.web;

import com.fasterxml.jackson.databind.JsonNode;

// Generic STOMP message envelope
public record MatchMessage(
        Integer version,
        String type,
        String matchId,
        String actorColor,
        String actionId,
        Long sequence,
        String phase,
        JsonNode payload
) {}
