-- ============================================================
-- Customer Service – Sample Data
-- Runs automatically after schema.sql on startup
-- ============================================================

-- Customers
INSERT INTO customers (name, contact_info, preferred_dealer_id, vehicle_ownership_details, loyalty_tier, status, created_at)
VALUES
('John Doe',
 '{"email":"john.doe@example.com","phone":"9876543210"}',
 1,
 '{"vin":"1HGBH41JXMN109186","model":"Honda City","year":2020}',
 'GOLD', 'ACTIVE', NOW()),

('Jane Smith',
 '{"email":"jane.smith@example.com","phone":"9988776655"}',
 2,
 '{"vin":"2T1BURHE0JC043821","model":"Toyota Fortuner","year":2022}',
 'SILVER', 'ACTIVE', NOW()),

('Raj Kumar',
 '{"email":"raj.kumar@example.com","phone":"9123456789"}',
 1,
 NULL,
 'BRONZE', 'ACTIVE', NOW()),

('Priya Sharma',
 '{"email":"priya.sharma@example.com","phone":"9900112233"}',
 3,
 '{"vin":"3VWSE69M73M000001","model":"Volkswagen Polo","year":2019}',
 'PLATINUM', 'ACTIVE', NOW());

-- Leads
INSERT INTO leads (customer_id, source, interested_model, status, assigned_to, notes, created_at)
VALUES
(1, 'WEBSITE',  'Honda CR-V',    'NEW',       NULL, 'Interested in SUV upgrade',               NOW()),
(2, 'REFERRAL', 'Toyota Innova', 'CONTACTED', 1,    'Follow-up scheduled for next week',        NOW()),
(3, 'WALK_IN',  'Honda Amaze',   'INTERESTED', 1,   'Prefers white colour variant',             NOW()),
(4, 'SOCIAL',   'VW Tiguan',     'CONVERTED', 2,    'Converted – quote raised in Sales service', NOW());

-- Interactions
INSERT INTO interactions (customer_id, user_id, channel, message, timestamp, outcome)
VALUES
(1, 1, 'CALL',
 'Discussed CR-V features and pricing. Customer is interested in a test drive.',
 NOW(), 'TEST_DRIVE_SCHEDULED'),

(2, 1, 'EMAIL',
 'Sent product brochure for Toyota Innova Crysta 2024 model.',
 NOW(), 'FOLLOW_UP'),

(3, 1, 'SMS',
 'Confirmed showroom appointment for this Saturday.',
 NOW(), 'APPOINTMENT_CONFIRMED'),

(4, 2, 'IN_PERSON',
 'Customer visited showroom, selected Tiguan Comfortline. Initiating paperwork.',
 NOW(), 'DEAL_CLOSED');
