// [SCRUM06B-F001-DB-001] Outpass request data store
// Persistent data store for Hostel E-Outpass Management System
// Supports full CRUD, search, filtering, status transitions, and audit metrics.

const fs = require("fs");
const path = require("path");
const { initialOutpasses } = require("./seedData");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "outpass_records.json");

class OutpassStore {
  constructor() {
    this._ensureStorage();
  }

  /**
   * Initializes data directory and storage file with seed data if needed
   */
  _ensureStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        this._writeToFile(initialOutpasses);
      } else {
        const raw = fs.readFileSync(DB_FILE, "utf-8").trim();
        if (!raw) {
          this._writeToFile(initialOutpasses);
        }
      }
    } catch (err) {
      console.error("[OutpassStore] Storage initialization error:", err);
      throw err;
    }
  }

  /**
   * Reads all records from persistent JSON file
   * @returns {Array} Array of outpass request objects
   */
  _readFromFile() {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content || "[]");
    } catch (err) {
      console.error("[OutpassStore] File read error:", err);
      return [];
    }
  }

  /**
   * Writes all records atomically to persistent JSON file
   * @param {Array} records 
   */
  _writeToFile(records) {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(records, null, 2), "utf-8");
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error("[OutpassStore] File write error:", err);
      throw err;
    }
  }

  /**
   * Generates a unique, standardized Outpass ID
   * @returns {string} e.g. "OP-2026-008"
   */
  _generateId(records) {
    const currentYear = new Date().getFullYear();
    const prefix = `OP-${currentYear}-`;
    const numbers = records
      .map(r => {
        if (r.id && r.id.startsWith(prefix)) {
          const num = parseInt(r.id.replace(prefix, ""), 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = String(maxNum + 1).padStart(3, "0");
    return `${prefix}${nextNum}`;
  }

  /**
   * Generates a digital gate pass security token for approved passes
   */
  _generateGatePassToken() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let token = "EOP-SEC-";
    for (let i = 0; i < 4; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Creates a new Outpass Request in the data store
   * @param {Object} data 
   * @returns {Object} Created outpass record
   */
  create(data) {
    // Validation
    const required = [
      "studentId",
      "studentName",
      "hostelBlock",
      "roomNumber",
      "destination",
      "reason",
      "departureTime",
      "expectedReturnTime"
    ];

    for (const field of required) {
      if (!data[field] || String(data[field]).trim() === "") {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const depDate = new Date(data.departureTime);
    const retDate = new Date(data.expectedReturnTime);

    if (isNaN(depDate.getTime())) {
      throw new Error("Invalid departure time");
    }
    if (isNaN(retDate.getTime())) {
      throw new Error("Invalid expected return time");
    }
    if (retDate <= depDate) {
      throw new Error("Expected return time must be after departure time");
    }

    const records = this._readFromFile();
    const id = this._generateId(records);
    const nowIso = new Date().toISOString();

    const newRecord = {
      id,
      studentId: String(data.studentId).trim().toUpperCase(),
      studentName: String(data.studentName).trim(),
      department: data.department || "General Engineering",
      year: data.year || "3rd Year",
      hostelBlock: String(data.hostelBlock).trim(),
      roomNumber: String(data.roomNumber).trim().toUpperCase(),
      studentPhone: data.studentPhone || "+91 90000 00000",
      parentName: data.parentName || "Parent / Guardian",
      parentPhone: data.parentPhone || "+91 90000 00000",
      parentConsent: data.parentConsent || "PENDING_CALL",
      outpassType: data.outpassType || "DAY_PASS",
      destination: String(data.destination).trim(),
      reason: String(data.reason).trim(),
      departureTime: depDate.toISOString(),
      expectedReturnTime: retDate.toISOString(),
      actualReturnTime: null,
      status: "PENDING",
      wardenRemarks: "",
      reviewedBy: "",
      reviewedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      gatePassToken: null,
      studentHistory: data.studentHistory || {
        totalOutpassesThisSem: 1,
        onTimeReturns: 1,
        overstays: 0,
        cgpa: "8.50",
        attendance: "90%"
      }
    };

    records.unshift(newRecord); // Place newest at front
    this._writeToFile(records);
    return newRecord;
  }

  /**
   * Retrieves an outpass by ID
   * @param {string} id 
   * @returns {Object|null}
   */
  getById(id) {
    if (!id) return null;
    const records = this._readFromFile();
    return records.find(r => r.id.toLowerCase() === id.toLowerCase()) || null;
  }

  /**
   * Query outpass requests with filtering and search capabilities
   * @param {Object} filters 
   * @returns {Array} Filtered list
   */
  getAll(filters = {}) {
    let records = this._readFromFile();

    // Filter by Status
    if (filters.status && filters.status !== "ALL") {
      const targetStatus = filters.status.toUpperCase();
      records = records.filter(r => r.status.toUpperCase() === targetStatus);
    }

    // Filter by Hostel Block
    if (filters.hostelBlock && filters.hostelBlock !== "ALL") {
      records = records.filter(r => 
        r.hostelBlock.toLowerCase().includes(filters.hostelBlock.toLowerCase())
      );
    }

    // Filter by Outpass Type
    if (filters.outpassType && filters.outpassType !== "ALL") {
      records = records.filter(r => r.outpassType === filters.outpassType);
    }

    // Full-text / Multi-field Search
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      records = records.filter(r => 
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.studentId && r.studentId.toLowerCase().includes(q)) ||
        (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
        (r.destination && r.destination.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.parentPhone && r.parentPhone.includes(q))
      );
    }

    // Sort order: default by creation timestamp descending
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return records;
  }

  /**
   * Query all pending requests
   * @param {Object} filters 
   * @returns {Array}
   */
  getPending(filters = {}) {
    return this.getAll({ ...filters, status: "PENDING" });
  }

  /**
   * Updates review status (Approve / Reject) with warden remarks
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Object} Updated record
   */
  updateStatus(id, { status, wardenRemarks = "", reviewedBy = "Chief Warden" }) {
    if (!id) throw new Error("Outpass ID is required");
    const normalizedStatus = String(status).toUpperCase();

    if (!["APPROVED", "REJECTED", "PENDING", "COMPLETED"].includes(normalizedStatus)) {
      throw new Error(`Invalid status: ${status}. Must be APPROVED, REJECTED, PENDING, or COMPLETED.`);
    }

    const records = this._readFromFile();
    const index = records.findIndex(r => r.id.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      throw new Error(`Outpass request with ID ${id} not found.`);
    }

    const current = records[index];
    const nowIso = new Date().toISOString();

    current.status = normalizedStatus;
    current.wardenRemarks = String(wardenRemarks).trim();
    current.reviewedBy = String(reviewedBy).trim();
    current.reviewedAt = nowIso;
    current.updatedAt = nowIso;

    if (normalizedStatus === "APPROVED") {
      if (!current.gatePassToken) {
        current.gatePassToken = this._generateGatePassToken();
      }
    } else if (normalizedStatus === "REJECTED") {
      current.gatePassToken = null;
    }

    records[index] = current;
    this._writeToFile(records);
    return current;
  }

  /**
   * Calculates dashboard summary statistics and active metrics
   * @returns {Object}
   */
  getStatistics() {
    const records = this._readFromFile();
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
      // Pending
      if (r.status === "PENDING") {
        pendingCount++;
        const depTime = new Date(r.departureTime);
        if (depTime <= threeHoursFromNow) {
          urgentPending++;
        }
      }

      // Actioned today
      if (r.reviewedAt && r.reviewedAt.slice(0, 10) === todayDateStr) {
        if (r.status === "APPROVED") approvedToday++;
        if (r.status === "REJECTED") rejectedToday++;
      }

      // Currently Outside monitoring
      // Approved pass where departure has occurred and return has not been marked or expected return is in future
      if (r.status === "APPROVED") {
        const depTime = new Date(r.departureTime);
        const expRet = new Date(r.expectedReturnTime);
        if (depTime <= now && (!r.actualReturnTime || expRet >= now)) {
          currentlyOutside++;
        }
      }

      // Block distribution
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

  /**
   * Resets database back to default seed data
   */
  resetWithSeed() {
    this._writeToFile(initialOutpasses);
    return { message: "Database reset to initial seed data successfully", count: initialOutpasses.length };
  }
}

// Export singleton instance
const outpassStore = new OutpassStore();

module.exports = {
  OutpassStore,
  outpassStore
};
