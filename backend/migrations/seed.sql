-- Seed data for Business Operations Management System
-- Password for all demo users: "password123" (hashed with bcrypt)

-- Insert demo users
INSERT INTO users (email, password_hash, first_name, last_name, role, phone) VALUES
('admin@company.com', '$2a$10$rQYJ5YKYVvXKaW8gLH8yLOXqHxBXmJh5e8o6P0gU5xJjLxN0K5V9i', 'Admin', 'User', 'admin', '555-0001'),
('manager@company.com', '$2a$10$rQYJ5YKYVvXKaW8gLH8yLOXqHxBXmJh5e8o6P0gU5xJjLxN0K5V9i', 'Sarah', 'Johnson', 'manager', '555-0002'),
('employee@company.com', '$2a$10$rQYJ5YKYVvXKaW8gLH8yLOXqHxBXmJh5e8o6P0gU5xJjLxN0K5V9i', 'John', 'Smith', 'employee', '555-0003'),
('accountant@company.com', '$2a$10$rQYJ5YKYVvXKaW8gLH8yLOXqHxBXmJh5e8o6P0gU5xJjLxN0K5V9i', 'Emily', 'Davis', 'accountant', '555-0004')
ON CONFLICT (email) DO NOTHING;

-- Insert demo customers
INSERT INTO customers (company_name, contact_name, email, phone, address, city, state, zip_code) VALUES
('Acme Corporation', 'Robert Brown', 'robert@acme.com', '555-1001', '123 Business Ave', 'New York', 'NY', '10001'),
('Tech Solutions Inc', 'Lisa White', 'lisa@techsolutions.com', '555-1002', '456 Innovation Dr', 'San Francisco', 'CA', '94105'),
('Global Enterprises', 'Michael Green', 'michael@globalent.com', '555-1003', '789 Commerce St', 'Chicago', 'IL', '60601'),
('Startup Hub', 'Jennifer Lee', 'jen@startuphub.com', '555-1004', '321 Venture Blvd', 'Austin', 'TX', '78701'),
('Creative Agency', 'David Chen', 'david@creativeagency.com', '555-1005', '654 Design Lane', 'Seattle', 'WA', '98101')
ON CONFLICT DO NOTHING;

-- Note: In a production environment, you would:
-- 1. NOT include seed data with default passwords
-- 2. Use environment-specific migration scripts
-- 3. Have proper password policies and require password changes on first login
