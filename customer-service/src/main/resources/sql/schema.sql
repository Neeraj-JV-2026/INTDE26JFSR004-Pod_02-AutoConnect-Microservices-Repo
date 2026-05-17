-- Customer Service Schema
-- Run this script to initialize the database manually.
-- JPA manages schema automatically when spring.jpa.hibernate.ddl-auto=update

CREATE DATABASE IF NOT EXISTS autoconnect_crm_db;
USE autoconnect_crm_db;

CREATE TABLE IF NOT EXISTS customers (
    customer_id     BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(200)    NOT NULL,
    contact_info    JSON,
    preferred_dealer_id BIGINT,
    vehicle_ownership_details JSON,
    loyalty_tier    VARCHAR(20),
    status          VARCHAR(20),
    created_at      DATETIME,
    PRIMARY KEY (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leads (
    lead_id             BIGINT          NOT NULL AUTO_INCREMENT,
    customer_id         BIGINT          NOT NULL,
    source              VARCHAR(100),
    interested_model    VARCHAR(100),
    status              VARCHAR(30)     DEFAULT 'NEW',
    assigned_to         BIGINT,
    created_at          DATETIME,
    notes               TEXT,
    PRIMARY KEY (lead_id),
    INDEX idx_leads_customer (customer_id),
    INDEX idx_leads_assigned_to (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS interactions (
    interaction_id  BIGINT      NOT NULL AUTO_INCREMENT,
    customer_id     BIGINT      NOT NULL,
    user_id         BIGINT      NOT NULL,
    channel         VARCHAR(30),
    message         TEXT,
    timestamp       DATETIME,
    outcome         VARCHAR(100),
    PRIMARY KEY (interaction_id),
    INDEX idx_interactions_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
