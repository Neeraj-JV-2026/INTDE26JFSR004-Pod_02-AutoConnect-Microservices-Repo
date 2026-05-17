-- Finance Service Database Schema
-- Database: autoconnect_db2

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id      BIGINT          NOT NULL AUTO_INCREMENT,
    customer_id     BIGINT          NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id   BIGINT,
    sub_total       DECIMAL(15, 2)  NOT NULL,
    tax_amount      DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
    total_amount    DECIMAL(15, 2)  NOT NULL,
    issued_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at          DATETIME,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ISSUED'
                        COMMENT 'ISSUED | PARTIAL | PAID | OVERDUE | CANCELLED',
    PRIMARY KEY (invoice_id),
    INDEX idx_invoices_customer (customer_id),
    INDEX idx_invoices_status   (status)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id              BIGINT          NOT NULL AUTO_INCREMENT,
    invoice_id              BIGINT          NOT NULL,
    amount                  DECIMAL(15, 2)  NOT NULL,
    payment_method          VARCHAR(50)     NOT NULL
                                COMMENT 'CREDIT_CARD | BANK_TRANSFER | CASH | FINANCING',
    transaction_reference   VARCHAR(100),
    paid_at                 DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'SUCCESS'
                                COMMENT 'SUCCESS | PENDING | FAILED',
    PRIMARY KEY (payment_id),
    INDEX idx_payments_invoice (invoice_id),
    CONSTRAINT fk_payments_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices (invoice_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    message         TEXT            NOT NULL,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id),
    INDEX idx_notifications_user    (user_id),
    INDEX idx_notifications_unread  (user_id, is_read)
);

CREATE TABLE IF NOT EXISTS reports (
    report_id       BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(200)    NOT NULL,
    type            VARCHAR(50)     NOT NULL
                        COMMENT 'SALES | INVENTORY | SERVICE | FINANCIAL',
    filters         JSON,
    output_uri      VARCHAR(500),
    generated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by    BIGINT,
    PRIMARY KEY (report_id),
    INDEX idx_reports_type          (type),
    INDEX idx_reports_generated_by  (generated_by)
);

CREATE TABLE IF NOT EXISTS tasks (
    task_id         BIGINT          NOT NULL AUTO_INCREMENT,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    assigned_to     BIGINT          NOT NULL,
    entity_type     VARCHAR(50)     COMMENT 'LEAD | DEAL | WORK_ORDER',
    entity_id       BIGINT,
    due_at          DATETIME,
    status          VARCHAR(20)     NOT NULL DEFAULT 'OPEN'
                        COMMENT 'OPEN | IN_PROGRESS | COMPLETED',
    PRIMARY KEY (task_id),
    INDEX idx_tasks_assigned    (assigned_to),
    INDEX idx_tasks_status      (status),
    INDEX idx_tasks_entity      (entity_type, entity_id)
);
