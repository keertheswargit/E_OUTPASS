// Outpass Request Repository
// Manages database persistence for Outpass Requests

const db = require("../config/db");

function getFreshSeedMap() {
  return new Map([
    [
      "OP-2026-001",
      {
        id: "OP-2026-001",
        student_id: "23IT101",
        student_name: "Keertheswar S",
        department: "Information Technology",
        hostel_block: "Block A (Boys)",
        room_number: "A-304",
        outpass_type: "WEEKEND_PASS",
        destination: "Trichy (Native Place)",
        reason: "Family function and weekend break.",
        departure_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 52 * 3600 * 1000).toISOString(),
        parent_name: "Senthil Nathan",
        parent_phone: "+91 94432 10987",
        parent_consent: "CONFIRMED_VIA_SMS",
        status: "PENDING",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    [
      "OP-2026-002",
      {
        id: "OP-2026-002",
        student_id: "23CS142",
        student_name: "Priya Dharshini M",
        department: "Computer Science and Engineering",
        hostel_block: "Block B (Girls)",
        room_number: "B-214",
        outpass_type: "EMERGENCY_PASS",
        destination: "Apollo Clinic, Gandhipuram",
        reason: "Severe dental toothache, scheduled appointment.",
        departure_time: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
        parent_name: "Meenakshi Sundaram",
        parent_phone: "+91 94876 54321",
        parent_consent: "VERIFIED",
        status: "PENDING",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    [
      "OP-2026-003",
      {
        id: "OP-2026-003",
        student_id: "22EC088",
        student_name: "Arvind Kumar R",
        department: "Electronics & Communication",
        hostel_block: "Block A (Boys)",
        room_number: "A-118",
        outpass_type: "DAY_PASS",
        destination: "Electronics Market",
        reason: "Purchasing project sensors and components.",
        departure_time: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        parent_name: "R. Radhakrishnan",
        parent_phone: "+91 93456 78901",
        parent_consent: "PENDING_CALL",
        status: "PENDING",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        created_at: new Date(Date.now() - 2700000).toISOString(),
        updated_at: new Date(Date.now() - 2700000).toISOString()
      }
    ],
    [
      "OP-2026-004",
      {
        id: "OP-2026-004",
        student_id: "23AI015",
        student_name: "Sneha Nair",
        department: "AI & Data Science",
        hostel_block: "Block B (Girls)",
        room_number: "B-108",
        outpass_type: "WEEKEND_PASS",
        destination: "Palakkad, Kerala (Hometown)",
        reason: "Sister's engagement ceremony at native place.",
        departure_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
        parent_name: "S. Nair",
        parent_phone: "+91 97861 23456",
        parent_consent: "VERIFIED",
        status: "PENDING",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        created_at: new Date(Date.now() - 5400000).toISOString(),
        updated_at: new Date(Date.now() - 5400000).toISOString()
      }
    ],
    [
      "OP-2026-005",
      {
        id: "OP-2026-005",
        student_id: "23ME034",
        student_name: "Mohammed Faizal",
        department: "Mechanical Engineering",
        hostel_block: "Block C (Boys)",
        room_number: "C-204",
        outpass_type: "DAY_PASS",
        destination: "PSG Tech Campus (Hackathon)",
        reason: "Representing college at 24-hour CAD design challenge.",
        departure_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
        parent_name: "A. Abdul Faizal",
        parent_phone: "+91 99441 23890",
        parent_consent: "PENDING_CALL",
        status: "PENDING",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        created_at: new Date(Date.now() - 6600000).toISOString(),
        updated_at: new Date(Date.now() - 6600000).toISOString()
      }
    ],
    [
      "OP-2026-006",
      {
        id: "OP-2026-006",
        student_id: "22IT115",
        student_name: "Deepa Lakshmi V",
        department: "Information Technology",
        hostel_block: "Block B (Girls)",
        room_number: "B-305",
        outpass_type: "DAY_PASS",
        destination: "Coimbatore Railway Station",
        reason: "Receiving grandmother arriving by Shatabdi train.",
        departure_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        parent_name: "V. Vijayaraghavan",
        parent_phone: "+91 94422 33445",
        parent_consent: "VERIFIED",
        status: "APPROVED",
        warden_remarks: "Approved over phone. Return before 8:30 PM gate close.",
        rejection_reason: null,
        approved_by: "WARDEN-002",
        created_at: new Date(Date.now() - 18000000).toISOString(),
        updated_at: new Date(Date.now() - 14400000).toISOString()
      }
    ],
    [
      "OP-2026-007",
      {
        id: "OP-2026-007",
        student_id: "24CS045",
        student_name: "Karthik Raja P",
        department: "Computer Science",
        hostel_block: "Block A (Boys)",
        room_number: "A-105",
        outpass_type: "EMERGENCY_PASS",
        destination: "Eye Foundation Hospital, RS Puram",
        reason: "Eye irritation and urgent ophthalmology checkup.",
        departure_time: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        parent_name: "P. Palanisamy",
        parent_phone: "+91 94441 55667",
        parent_consent: "VERIFIED",
        status: "PENDING",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        created_at: new Date(Date.now() - 1200000).toISOString(),
        updated_at: new Date(Date.now() - 1200000).toISOString()
      }
    ],
    [
      "OP-2026-008",
      {
        id: "OP-2026-008",
        student_id: "23BT028",
        student_name: "Ananya Ramesh",
        department: "Biotechnology",
        hostel_block: "Block D (Girls)",
        room_number: "D-201",
        outpass_type: "WEEKEND_PASS",
        destination: "Salem (Native Home)",
        reason: "Attending family festival celebration with relatives.",
        departure_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 50 * 3600 * 1000).toISOString(),
        parent_name: "Ramesh K",
        parent_phone: "+91 94433 88990",
        parent_consent: "VERIFIED",
        status: "PENDING",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        created_at: new Date(Date.now() - 2400000).toISOString(),
        updated_at: new Date(Date.now() - 2400000).toISOString()
      }
    ],
    [
      "OP-2026-009",
      {
        id: "OP-2026-009",
        student_id: "23EE062",
        student_name: "Sanjay V",
        department: "Electrical & Electronics",
        hostel_block: "Block C (Boys)",
        room_number: "C-312",
        outpass_type: "DAY_PASS",
        destination: "Local Power Substation / Industrial Visit",
        reason: "Field study for electrical power transmission project.",
        departure_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        parent_name: "V. Velmurugan",
        parent_phone: "+91 98411 77889",
        parent_consent: "VERIFIED",
        status: "APPROVED",
        warden_remarks: "Permission granted for academic study.",
        rejection_reason: null,
        approved_by: "WARDEN-001",
        created_at: new Date(Date.now() - 10800000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString()
      }
    ],
    [
      "OP-2026-010",
      {
        id: "OP-2026-010",
        student_id: "24EC071",
        student_name: "Kavitha S",
        department: "Electronics & Communication",
        hostel_block: "Block D (Girls)",
        room_number: "D-115",
        outpass_type: "DAY_PASS",
        destination: "Cross Cut Road Market",
        reason: "Purchasing books and hostel essentials.",
        departure_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        expected_return_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        parent_name: "S. Shanmugam",
        parent_phone: "+91 98402 33445",
        parent_consent: "PENDING_CALL",
        status: "PENDING",
        warden_remarks: null,
        rejection_reason: null,
        approved_by: null,
        created_at: new Date(Date.now() - 900000).toISOString(),
        updated_at: new Date(Date.now() - 900000).toISOString()
      }
    ]
  ]);
}

let memoryOutpassStore = getFreshSeedMap();

class OutpassRepository {
  /**
   * Finds an outpass request by its unique ID
   * @param {string} id
   * @param {Object} [client] - Optional active transaction client
   * @param {boolean} [forUpdate=false] - If true, applies row lock in PostgreSQL
   * @returns {Promise<Object|null>}
   */
  async findById(id, client = null, forUpdate = false) {
    if (!id) return null;

    try {
      const queryRunner = client || db;
      const sql = `
        SELECT * FROM outpass_requests 
        WHERE id = $1 
        ${forUpdate ? "FOR UPDATE" : ""};
      `;
      const result = await queryRunner.query(sql, [id]);
      return result.rows[0] || null;
    } catch (pgError) {
      if (pgError.code === "ECONNREFUSED" || pgError.code === "28P01" || pgError.code === "3D000" || !db.isPostgresConnected()) {
        const found = memoryOutpassStore.get(id);
        return found ? { ...found } : null;
      }
      throw pgError;
    }
  }

  /**
   * Updates status, remarks, and audit fields of an outpass request
   * @param {string} id
   * @param {Object} updateData
   * @param {string} updateData.status
   * @param {string} [updateData.wardenRemarks]
   * @param {string} [updateData.rejectionReason]
   * @param {string} [updateData.approvedBy]
   * @param {Object} [client]
   * @returns {Promise<Object>} Updated record
   */
  async updateStatus(id, {
    status,
    wardenRemarks = null,
    rejectionReason = null,
    approvedBy = null
  }, client = null) {
    try {
      const queryRunner = client || db;
      const sql = `
        UPDATE outpass_requests
        SET 
          status = $1,
          warden_remarks = $2,
          rejection_reason = $3,
          approved_by = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING *;
      `;
      const values = [status, wardenRemarks, rejectionReason, approvedBy, id];
      const result = await queryRunner.query(sql, values);
      return result.rows[0];
    } catch (pgError) {
      if (pgError.code === "ECONNREFUSED" || pgError.code === "28P01" || pgError.code === "3D000" || !db.isPostgresConnected()) {
        const item = memoryOutpassStore.get(id);
        if (!item) throw new Error(`Outpass request ${id} not found`);
        item.status = status;
        item.warden_remarks = wardenRemarks || null;
        item.rejection_reason = rejectionReason || null;
        item.approved_by = approvedBy || null;
        item.updated_at = new Date().toISOString();
        memoryOutpassStore.set(id, item);
        return { ...item };
      }
      throw pgError;
    }
  }

  /**
   * Creates a new outpass request
   */
  async create(data, client = null) {
    try {
      const queryRunner = client || db;
      const sql = `
        INSERT INTO outpass_requests (
          id, student_id, student_name, department, hostel_block, room_number,
          outpass_type, destination, reason, departure_time, expected_return_time,
          parent_name, parent_phone, parent_consent, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'PENDING')
        RETURNING *;
      `;
      const values = [
        data.id, data.student_id, data.student_name, data.department, data.hostel_block, data.room_number,
        data.outpass_type, data.destination, data.reason, data.departure_time, data.expected_return_time,
        data.parent_name, data.parent_phone, data.parent_consent || 'PENDING_CALL'
      ];
      const result = await queryRunner.query(sql, values);
      return result.rows[0];
    } catch (pgError) {
      if (pgError.code === "ECONNREFUSED" || pgError.code === "28P01" || pgError.code === "3D000" || !db.isPostgresConnected()) {
        const item = { ...data, status: "PENDING", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        memoryOutpassStore.set(data.id, item);
        return item;
      }
      throw pgError;
    }
  }

  /**
   * Normalizes a database row to a standard application object
   */
  _mapRowToRecord(r) {
    if (!r) return null;
    return {
      id: r.id,
      studentId: r.student_id || r.studentId,
      studentName: r.student_name || r.studentName,
      department: r.department,
      year: r.year || "3rd Year",
      hostelBlock: r.hostel_block || r.hostelBlock,
      roomNumber: r.room_number || r.roomNumber,
      studentPhone: r.student_phone || r.studentPhone || "+91 98765 43210",
      parentName: r.parent_name || r.parentName,
      parentPhone: r.parent_phone || r.parentPhone,
      parentConsent: r.parent_consent || r.parentConsent || "PENDING_CALL",
      outpassType: r.outpass_type || r.outpassType,
      destination: r.destination,
      reason: r.reason,
      departureTime: r.departure_time || r.departureTime,
      expectedReturnTime: r.expected_return_time || r.expectedReturnTime,
      actualReturnTime: r.actual_return_time || r.actualReturnTime || null,
      status: r.status,
      wardenRemarks: r.warden_remarks || r.wardenRemarks || "",
      rejectionReason: r.rejection_reason || r.rejectionReason || null,
      approvedBy: r.approved_by || r.approvedBy || null,
      reviewedBy: r.approved_by || r.reviewedBy || (r.status === "APPROVED" ? "Hostel Warden" : null),
      reviewedAt: r.updated_at || r.reviewedAt || null,
      createdAt: r.created_at || r.createdAt,
      updatedAt: r.updated_at || r.updatedAt,
      gatePassToken: r.status === "APPROVED" ? (r.gate_pass_token || `EOP-SEC-${(r.id || "").replace(/[^0-9]/g, "").slice(-4)}` || "EOP-SEC-8921") : null,
      studentHistory: r.studentHistory || {
        totalOutpassesThisSem: 2,
        onTimeReturns: 2,
        overstays: 0,
        cgpa: "8.80",
        attendance: "94%"
      }
    };
  }

  /**
   * Retrieves all outpass requests with filtering, querying PostgreSQL first
   */
  async getAll(filters = {}) {
    try {
      if (db.isPostgresConnected()) {
        let sql = `SELECT * FROM outpass_requests WHERE 1=1`;
        const params = [];

        if (filters.status && filters.status !== "ALL") {
          params.push(filters.status.toUpperCase());
          sql += ` AND UPPER(status) = $${params.length}`;
        }

        if (filters.hostelBlock && filters.hostelBlock !== "ALL") {
          params.push(`%${filters.hostelBlock}%`);
          sql += ` AND hostel_block ILIKE $${params.length}`;
        }

        if (filters.outpassType && filters.outpassType !== "ALL") {
          params.push(filters.outpassType);
          sql += ` AND outpass_type = $${params.length}`;
        }

        if (filters.search && filters.search.trim()) {
          params.push(`%${filters.search.trim()}%`);
          const p = `$${params.length}`;
          sql += ` AND (student_name ILIKE ${p} OR student_id ILIKE ${p} OR room_number ILIKE ${p} OR destination ILIKE ${p} OR reason ILIKE ${p} OR id ILIKE ${p})`;
        }

        sql += ` ORDER BY created_at DESC;`;
        const result = await db.query(sql, params);
        return result.rows.map(r => this._mapRowToRecord(r));
      }
    } catch (pgError) {
      console.warn("[OutpassRepo] Postgres query failed, falling back to outpassStore:", pgError.message);
    }

    const { outpassStore } = require("../db/outpassStore");
    return outpassStore.getAll(filters);
  }

  /**
   * Retrieves pending outpass requests
   */
  async getPending(filters = {}) {
    return this.getAll({ ...filters, status: "PENDING" });
  }

  /**
   * Computes dashboard statistics from live PostgreSQL data
   */
  async getStatistics() {
    try {
      if (db.isPostgresConnected()) {
        const records = await this.getAll();
        const now = new Date();
        const threeHoursFromNow = new Date(now.getTime() + 3 * 3600 * 1000);
        const todayDateStr = now.toISOString().slice(0, 10);

        let pendingCount = 0;
        let approvedToday = 0;
        let rejectedToday = 0;
        let currentlyOutside = 0;
        let urgentPending = 0;
        const blockDistribution = {};

        for (const r of records) {
          if (r.status === "PENDING") {
            pendingCount++;
            const depTime = new Date(r.departureTime);
            if (depTime <= threeHoursFromNow) {
              urgentPending++;
            }
          }

          if (r.reviewedAt && String(r.reviewedAt).slice(0, 10) === todayDateStr) {
            if (r.status === "APPROVED") approvedToday++;
            if (r.status === "REJECTED") rejectedToday++;
          }

          if (r.status === "APPROVED") {
            const depTime = new Date(r.departureTime);
            const expRet = new Date(r.expectedReturnTime);
            if (depTime <= now && (!r.actualReturnTime || expRet >= now)) {
              currentlyOutside++;
            }
          }

          const block = r.hostelBlock || "Other";
          blockDistribution[block] = (blockDistribution[block] || 0) + 1;
        }

        return {
          pendingCount,
          approvedToday,
          rejectedToday,
          currentlyOutside,
          urgentPending,
          totalRequests: records.length,
          blockDistribution,
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (pgError) {
      console.warn("[OutpassRepo] Postgres getStatistics failed, falling back:", pgError.message);
    }

    const { outpassStore } = require("../db/outpassStore");
    return outpassStore.getStatistics();
  }

  /**
   * Resets in-memory store and PostgreSQL test records for clean testing
   */
  _resetMemoryStore() {
    memoryOutpassStore = getFreshSeedMap();
  }

  async resetDatabaseForTests() {
    this._resetMemoryStore();
    try {
      await db.query(`
        UPDATE outpass_requests
        SET status = 'PENDING', approved_by = NULL, warden_remarks = NULL, rejection_reason = NULL
        WHERE id IN ('OP-2026-001', 'OP-2026-002', 'OP-2026-003', 'OP-2026-004', 'OP-2026-005', 'OP-2026-007', 'OP-2026-008', 'OP-2026-010');
        DELETE FROM outpass_status_history WHERE outpass_id > 'OP-2026-010';
        DELETE FROM outpass_requests WHERE id > 'OP-2026-010';
      `);
      await db.query(`
        DELETE FROM outpass_status_history
        WHERE outpass_id IN ('OP-2026-001', 'OP-2026-002') AND previous_status != 'NONE';
      `);
    } catch (err) {
      // Ignore if offline
    }
  }
}

module.exports = new OutpassRepository();
