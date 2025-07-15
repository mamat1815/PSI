-- Create a Super Admin user for development/testing
-- Password: admin123 (hashed with bcrypt)

INSERT INTO "User" (
  id,
  name,
  email,
  password,
  role,
  "emailVerified"
) VALUES (
  'superadmin-001',
  'Super Administrator',
  'admin@uacad.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBagSMATXlDPmS', -- bcrypt hash of "admin123"
  'SuperAdmin',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role;
