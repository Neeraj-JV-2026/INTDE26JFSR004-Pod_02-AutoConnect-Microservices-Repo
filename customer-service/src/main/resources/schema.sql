-- ============================================================
-- Customer Service – H2 Schema (MySQL-compat mode)
-- Runs automatically on startup via spring.sql.init.mode=always
-- ============================================================

DROP TABLE IF EXISTS interactions;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    customer_id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                      VARCHAR(200)  NOT NULL,
    contact_info              TEXT,
    preferred_dealer_id       BIGINT,
    vehicle_ownership_details TEXT,
    loyalty_tier              VARCHAR(20),
    status                    VARCHAR(20),
    created_at                TIMESTAMP
);

CREATE TABLE leads (
    lead_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id      BIGINT       NOT NULL,
    source           VARCHAR(100),
    interested_model VARCHAR(100),
    status           VARCHAR(30)  DEFAULT 'NEW',
    assigned_to      BIGINT,
    created_at       TIMESTAMP,
    notes            TEXT,
    INDEX idx_leads_customer (customer_id),
    INDEX idx_leads_assigned  (assigned_to)
);

CREATE TABLE interactions (
    interaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id    BIGINT      NOT NULL,
    user_id        BIGINT      NOT NULL,
    channel        VARCHAR(30),
    message        TEXT,
    timestamp      TIMESTAMP,
    outcome        VARCHAR(100),
    INDEX idx_interactions_customer (customer_id)
);
