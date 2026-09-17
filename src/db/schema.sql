-- ============================================================================
-- SCRUM 6B: E-Outpass Management System
-- MODULE 1 [SCRUM06B-F002-DB-001]: Outpass Status History Database Schema
-- Target Database: PostgreSQL 14+ (Tested on PostgreSQL 18)
-- ============================================================================

-- 1. Create Users Table (Students, Wardens, Admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY, -- Student Roll No (e.g. '23IT101') or Warden ID (e.g. 'WARDEN-001')
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT 'password123',
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'WARDEN', 'ADMIN')),
    hostel_block VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Create Outpass Requests Table (Existing Master Entity)
CREATE TABLE IF NOT EXISTS outpass_requests (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'OP-2026-001'
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    student_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    hostel_block VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    outpass_type VARCHAR(30) NOT NULL CHECK (outpass_type IN ('DAY_PASS', 'WEEKEND_PASS', 'EMERGENCY_PASS', 'VACATION_PASS')),
    destination VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    expected_return_time TIMESTAMPTZ NOT NULL,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20) NOT NULL,
    parent_consent VARCHAR(30) DEFAULT 'PENDING_CALL' CHECK (parent_consent IN ('VERIFIED', 'PENDING_CALL', 'CONFIRMED_VIA_SMS', 'NOT_REQUIRED')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'COMPLETED')),
    rejection_reason TEXT,
    warden_remarks TEXT,
    approved_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_return_after_departure CHECK (expected_return_time > departure_time)
);

-- 3. [SCRUM06B-F002-DB-001] Outpass Status History Table
-- Maintains the complete chronological audit trail of all status transitions
CREATE TABLE IF NOT EXISTS outpass_status_history (
    id SERIAL PRIMARY KEY,
    outpass_id VARCHAR(50) NOT NULL REFERENCES outpass_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL CHECK (new_status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'COMPLETED')),
    changed_by VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    changed_by_role VARCHAR(20) NOT NULL CHECK (changed_by_role IN ('STUDENT', 'WARDEN', 'ADMIN')),
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks TEXT,
    rejection_reason TEXT
);

-- Indexes for high-performance querying and chronological audit retrieval
CREATE INDEX IF NOT EXISTS idx_status_history_outpass_id 
    ON outpass_status_history(outpass_id);

CREATE INDEX IF NOT EXISTS idx_status_history_changed_at 
    ON outpass_status_history(changed_at ASC);

-- Composite Index specifically for fast chronological retrieval of history for a given outpass
CREATE INDEX IF NOT EXISTS idx_status_history_chronological 
    ON outpass_status_history(outpass_id, changed_at ASC);
