-- Sample seed data for Finance Service
-- Run after schema.sql (or with spring.sql.init.mode=always)

-- ============================================================
-- Invoices
-- ============================================================
INSERT INTO invoices (customer_id, related_entity_type, related_entity_id, sub_total, tax_amount, total_amount, due_at, status)
VALUES
    (1, 'DEAL',       101, 9000.00, 900.00,  9900.00,  DATE_ADD(NOW(), INTERVAL 30 DAY), 'ISSUED'),
    (1, 'DEAL',       102, 5000.00, 500.00,  5500.00,  DATE_ADD(NOW(), INTERVAL 15 DAY), 'PARTIAL'),
    (2, 'WORK_ORDER', 201, 2500.00, 250.00,  2750.00,  DATE_ADD(NOW(), INTERVAL 30 DAY), 'ISSUED'),
    (3, 'SYSTEM',     NULL, 750.00,  75.00,   825.00,  DATE_SUB(NOW(), INTERVAL  5 DAY), 'OVERDUE'),
    (4, 'DEAL',       103, 1200.00, 120.00,  1320.00,  DATE_ADD(NOW(), INTERVAL 45 DAY), 'PAID'),
    (5, 'WORK_ORDER', 202, 3300.00, 330.00,  3630.00,  DATE_ADD(NOW(), INTERVAL 20 DAY), 'ISSUED');

-- ============================================================
-- Payments
-- ============================================================
INSERT INTO payments (invoice_id, amount, payment_method, transaction_reference, status)
VALUES
    (2, 2000.00, 'BANK_TRANSFER', 'TXN-BT-20240001', 'SUCCESS'),
    (5, 1320.00, 'CREDIT_CARD',   'TXN-CC-20240002', 'SUCCESS');

-- ============================================================
-- Notifications
-- ============================================================
INSERT INTO notifications (user_id, title, message, is_read)
VALUES
    (1, 'Invoice Generated',   'Invoice #1 for $9,900.00 has been issued. Payment due in 30 days.',  FALSE),
    (1, 'Payment Received',    'Partial payment of $2,000.00 received for Invoice #2.',              TRUE),
    (2, 'Invoice Generated',   'Invoice #3 for $2,750.00 has been issued.',                          FALSE),
    (3, 'Invoice Overdue',     'Invoice #4 is overdue. Please make payment immediately.',            FALSE),
    (4, 'Payment Confirmed',   'Payment for Invoice #5 confirmed. Thank you!',                       TRUE),
    (5, 'Invoice Generated',   'Invoice #6 for $3,630.00 has been issued. Payment due in 20 days.', FALSE);

-- ============================================================
-- Reports
-- ============================================================
INSERT INTO reports (name, type, filters, output_uri, generated_by)
VALUES
    ('Q1 Sales Report',           'SALES',     '{"quarter": "Q1", "year": 2024}',                     '/reports/download/sales-1711929600000',     1),
    ('Annual Financial Summary',  'FINANCIAL', '{"year": 2024, "includeOverdue": true}',              '/reports/download/financial-1711929700000', 1),
    ('Service Report - March',    'SERVICE',   '{"month": "March", "year": 2024, "region": "South"}', '/reports/download/service-1711929800000',   2),
    ('Inventory Snapshot',        'INVENTORY', '{"asOf": "2024-03-31"}',                              '/reports/download/inventory-1711929900000', 3);

-- ============================================================
-- Tasks
-- ============================================================
INSERT INTO tasks (title, description, assigned_to, entity_type, entity_id, due_at, status)
VALUES
    ('Follow up on Invoice #1',       'Call customer to confirm receipt of invoice.',           1, 'DEAL',       101, DATE_ADD(NOW(), INTERVAL  3 DAY), 'OPEN'),
    ('Resolve overdue Invoice #4',    'Send payment reminder and escalate if no response.',     2, 'DEAL',       NULL, DATE_ADD(NOW(), INTERVAL  1 DAY), 'IN_PROGRESS'),
    ('Prepare Q2 Financial Report',   'Compile data from all invoices for Q2 reporting.',       1, 'WORK_ORDER', NULL, DATE_ADD(NOW(), INTERVAL 14 DAY), 'OPEN'),
    ('Verify payment TXN-CC-20240002','Cross-check credit card payment with bank statement.',   3, 'DEAL',       103, DATE_ADD(NOW(), INTERVAL  2 DAY), 'COMPLETED'),
    ('Audit Work Order #202',         'Review all charges and confirm with operations team.',   2, 'WORK_ORDER', 202, DATE_ADD(NOW(), INTERVAL  7 DAY), 'OPEN');
