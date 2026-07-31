-- Ārohaṇa-rana — Initial schema (MySQL Compatible)
-- V1: players, identities, matches, match_events

CREATE TABLE IF NOT EXISTS player (
    id          VARCHAR(36) PRIMARY KEY,
    username    VARCHAR(32) UNIQUE NOT NULL,
    display_name VARCHAR(64) NOT NULL,
    rating      INT NOT NULL DEFAULT 1200,
    wins        INT NOT NULL DEFAULT 0,
    losses      INT NOT NULL DEFAULT 0,
    draws       INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS identity (
    id              VARCHAR(36) PRIMARY KEY,
    player_id       VARCHAR(36) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    email_verified  BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `match` (
    id              VARCHAR(36) PRIMARY KEY,
    white_player_id VARCHAR(36),
    black_player_id VARCHAR(36),
    variant         VARCHAR(16) NOT NULL DEFAULT 'CLASSIC',
    custom_pieces   TEXT,  -- JSON array of piece types if variant=CUSTOM
    status          VARCHAR(16) NOT NULL DEFAULT 'WAITING',
    winner_color    VARCHAR(5),  -- 'WHITE' | 'BLACK' | NULL
    white_score     INT NOT NULL DEFAULT 0,
    black_score     INT NOT NULL DEFAULT 0,
    timer_enabled   BOOLEAN NOT NULL DEFAULT false,
    reserve_seconds INT NOT NULL DEFAULT 0,
    started_at      TIMESTAMP NULL,
    ended_at        TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (white_player_id) REFERENCES player(id) ON DELETE SET NULL,
    FOREIGN KEY (black_player_id) REFERENCES player(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS match_event (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id    VARCHAR(36) NOT NULL,
    turn        INT NOT NULL,
    event_type  VARCHAR(40) NOT NULL,  -- SPAWN, MOVE, CAPTURE, PROMOTION, etc.
    actor_color VARCHAR(5) NOT NULL,
    payload     JSON NOT NULL,  -- full event data (using JSON in MySQL)
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES `match`(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matchmaking_queue (
    id          VARCHAR(36) PRIMARY KEY,
    player_id   VARCHAR(36) NOT NULL,
    variant     VARCHAR(16) NOT NULL DEFAULT 'CLASSIC',
    rating      INT NOT NULL,
    joined_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE
);

CREATE INDEX idx_match_event_match ON match_event(match_id);
CREATE INDEX idx_matchmaking_queue_variant ON matchmaking_queue(variant, rating);
