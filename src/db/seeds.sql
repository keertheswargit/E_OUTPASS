-- ============================================================================
-- SCRUM 6B: E-Outpass Management System
-- Seed Data for PostgreSQL / pgAdmin 4: Multiple Boys & Girls Blocks
-- ============================================================================

-- 1. Insert Registered Users (Wardens and Students from Boys & Girls Blocks)
INSERT INTO users (id, name, email, password, role, hostel_block, phone) VALUES
-- Wardens
('WARDEN-001', 'Dr. R. Sundaram', 'warden.sundaram@college.edu', 'warden123', 'WARDEN', 'Block A & C (Boys)', '+91 94432 00001'),
('WARDEN-002', 'Dr. S. Meenakshi', 'warden.meenakshi@college.edu', 'warden123', 'WARDEN', 'Block B & D (Girls)', '+91 94432 00002'),

-- Boys Hostel (Block A & Block C)
('23IT101', 'Keertheswar S', 'keertheswar@student.college.edu', 'student123', 'STUDENT', 'Block A (Boys)', '+91 98765 43210'),
('22EC088', 'Arvind Kumar R', 'arvind.ec@student.college.edu', 'student123', 'STUDENT', 'Block A (Boys)', '+91 91234 56780'),
('24CS045', 'Karthik Raja P', 'karthik.cs@student.college.edu', 'student123', 'STUDENT', 'Block A (Boys)', '+91 98401 23456'),
('23ME034', 'Mohammed Faizal', 'faizal.me@student.college.edu', 'student123', 'STUDENT', 'Block C (Boys)', '+91 96551 23478'),
('23EE062', 'Sanjay V', 'sanjay.ee@student.college.edu', 'student123', 'STUDENT', 'Block C (Boys)', '+91 99440 98765'),

-- Girls Hostel (Block B & Block D)
('23CS142', 'Priya Dharshini M', 'priya.cs@student.college.edu', 'student123', 'STUDENT', 'Block B (Girls)', '+91 97890 12345'),
('23AI015', 'Sneha Nair', 'sneha.ai@student.college.edu', 'student123', 'STUDENT', 'Block B (Girls)', '+91 98945 61234'),
('22IT115', 'Deepa Lakshmi V', 'deepa.it@student.college.edu', 'student123', 'STUDENT', 'Block B (Girls)', '+91 98421 98765'),
('23BT028', 'Ananya Ramesh', 'ananya.bt@student.college.edu', 'student123', 'STUDENT', 'Block D (Girls)', '+91 97900 11223'),
('24EC071', 'Kavitha S', 'kavitha.ec@student.college.edu', 'student123', 'STUDENT', 'Block D (Girls)', '+91 94455 66778')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    hostel_block = EXCLUDED.hostel_block,
    phone = EXCLUDED.phone;

-- 2. Insert Outpass Requests from Both Boys and Girls Blocks
INSERT INTO outpass_requests (
    id, student_id, student_name, department, hostel_block, room_number, 
    outpass_type, destination, reason, departure_time, expected_return_time, 
    parent_name, parent_phone, parent_consent, status, warden_remarks, rejection_reason, approved_by, created_at, updated_at
) VALUES
-- Boys Block A
(
    'OP-2026-001', '23IT101', 'Keertheswar S', 'Information Technology', 'Block A (Boys)', 'A-304',
    'WEEKEND_PASS', 'Trichy (Native Place)', 'Family function and weekend break.',
    NOW() + INTERVAL '2 hours', NOW() + INTERVAL '52 hours',
    'Senthil Nathan', '+91 94432 10987', 'CONFIRMED_VIA_SMS', 'PENDING',
    NULL, NULL, NULL, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'
),
(
    'OP-2026-003', '22EC088', 'Arvind Kumar R', 'Electronics & Communication', 'Block A (Boys)', 'A-118',
    'DAY_PASS', 'Town Hall Electronics Market', 'Purchasing project sensors and components.',
    NOW() + INTERVAL '3 hours', NOW() + INTERVAL '8 hours',
    'R. Radhakrishnan', '+91 93456 78901', 'PENDING_CALL', 'PENDING',
    NULL, NULL, NULL, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'
),
(
    'OP-2026-007', '24CS045', 'Karthik Raja P', 'Computer Science', 'Block A (Boys)', 'A-105',
    'EMERGENCY_PASS', 'Eye Foundation Hospital, RS Puram', 'Eye irritation and urgent checkup.',
    NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours',
    'P. Palanisamy', '+91 94441 55667', 'VERIFIED', 'PENDING',
    NULL, NULL, NULL, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'
),

-- Boys Block C
(
    'OP-2026-005', '23ME034', 'Mohammed Faizal', 'Mechanical Engineering', 'Block C (Boys)', 'C-204',
    'DAY_PASS', 'PSG Tech Campus (Hackathon)', 'Representing college at 24-hour CAD design challenge.',
    NOW() + INTERVAL '4 hours', NOW() + INTERVAL '28 hours',
    'A. Abdul Faizal', '+91 99441 23890', 'PENDING_CALL', 'PENDING',
    NULL, NULL, NULL, NOW() - INTERVAL '110 minutes', NOW() - INTERVAL '110 minutes'
),
(
    'OP-2026-009', '23EE062', 'Sanjay V', 'Electrical & Electronics', 'Block C (Boys)', 'C-312',
    'DAY_PASS', 'Local Power Substation / Industrial Visit', 'Field study for power systems project.',
    NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours',
    'V. Velmurugan', '+91 98411 77889', 'VERIFIED', 'APPROVED',
    'Permission granted for academic study.', NULL, 'WARDEN-001', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours'
),

-- Girls Block B
(
    'OP-2026-002', '23CS142', 'Priya Dharshini M', 'Computer Science and Engineering', 'Block B (Girls)', 'B-214',
    'EMERGENCY_PASS', 'Apollo Clinic, Gandhipuram', 'Severe dental toothache, scheduled appointment.',
    NOW() + INTERVAL '1 hour', NOW() + INTERVAL '5 hours',
    'Meenakshi Sundaram', '+91 94876 54321', 'VERIFIED', 'PENDING',
    NULL, NULL, NULL, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'
),
(
    'OP-2026-004', '23AI015', 'Sneha Nair', 'AI & Data Science', 'Block B (Girls)', 'B-108',
    'WEEKEND_PASS', 'Palakkad, Kerala (Hometown)', 'Sister engagement ceremony at native place.',
    NOW() + INTERVAL '6 hours', NOW() + INTERVAL '60 hours',
    'S. Nair', '+91 97861 23456', 'VERIFIED', 'PENDING',
    NULL, NULL, NULL, NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '90 minutes'
),
(
    'OP-2026-006', '22IT115', 'Deepa Lakshmi V', 'Information Technology', 'Block B (Girls)', 'B-305',
    'DAY_PASS', 'Coimbatore Railway Station', 'Receiving family members arriving by Shatabdi train.',
    NOW() - INTERVAL '4 hours', NOW() + INTERVAL '4 hours',
    'V. Vijayaraghavan', '+91 94422 33445', 'VERIFIED', 'APPROVED',
    'Approved over phone. Return before 8:30 PM gate close.', NULL, 'WARDEN-002', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours'
),

-- Girls Block D
(
    'OP-2026-008', '23BT028', 'Ananya Ramesh', 'Biotechnology', 'Block D (Girls)', 'D-201',
    'WEEKEND_PASS', 'Salem (Native Home)', 'Attending family festival celebration.',
    NOW() + INTERVAL '5 hours', NOW() + INTERVAL '50 hours',
    'Ramesh K', '+91 94433 88990', 'VERIFIED', 'PENDING',
    NULL, NULL, NULL, NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'
),
(
    'OP-2026-010', '24EC071', 'Kavitha S', 'Electronics & Communication', 'Block D (Girls)', 'D-115',
    'DAY_PASS', 'Cross Cut Road Market', 'Purchasing books and hostel essentials.',
    NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours',
    'S. Shanmugam', '+91 98402 33445', 'PENDING_CALL', 'PENDING',
    NULL, NULL, NULL, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    warden_remarks = EXCLUDED.warden_remarks,
    updated_at = EXCLUDED.updated_at;

-- 3. Insert Status History Audit Records for all requests
INSERT INTO outpass_status_history (
    outpass_id, previous_status, new_status, changed_by, changed_by_role, changed_at, remarks
) VALUES
('OP-2026-001', 'NONE', 'PENDING', '23IT101', 'STUDENT', NOW() - INTERVAL '1 hour', 'Initial application submitted by student.'),
('OP-2026-002', 'NONE', 'PENDING', '23CS142', 'STUDENT', NOW() - INTERVAL '30 minutes', 'Initial application submitted by student.'),
('OP-2026-003', 'NONE', 'PENDING', '22EC088', 'STUDENT', NOW() - INTERVAL '45 minutes', 'Initial application submitted by student.'),
('OP-2026-004', 'NONE', 'PENDING', '23AI015', 'STUDENT', NOW() - INTERVAL '90 minutes', 'Initial application submitted by student.'),
('OP-2026-005', 'NONE', 'PENDING', '23ME034', 'STUDENT', NOW() - INTERVAL '110 minutes', 'Initial application submitted by student.'),
('OP-2026-006', 'NONE', 'PENDING', '22IT115', 'STUDENT', NOW() - INTERVAL '5 hours', 'Initial application submitted by student.'),
('OP-2026-006', 'PENDING', 'APPROVED', 'WARDEN-002', 'WARDEN', NOW() - INTERVAL '4 hours', 'Approved over phone. Return before 8:30 PM.'),
('OP-2026-007', 'NONE', 'PENDING', '24CS045', 'STUDENT', NOW() - INTERVAL '20 minutes', 'Initial emergency application submitted.'),
('OP-2026-008', 'NONE', 'PENDING', '23BT028', 'STUDENT', NOW() - INTERVAL '40 minutes', 'Initial application submitted by student.'),
('OP-2026-009', 'NONE', 'PENDING', '23EE062', 'STUDENT', NOW() - INTERVAL '3 hours', 'Initial application submitted by student.'),
('OP-2026-009', 'PENDING', 'APPROVED', 'WARDEN-001', 'WARDEN', NOW() - INTERVAL '2 hours', 'Permission granted for academic study.'),
('OP-2026-010', 'NONE', 'PENDING', '24EC071', 'STUDENT', NOW() - INTERVAL '15 minutes', 'Initial application submitted by student.')
ON CONFLICT DO NOTHING;
