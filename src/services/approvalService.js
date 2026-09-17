// [SCRUM06B-F002-BE-001] Outpass Approval/Rejection Service
// Handles business logic, state transition validation, and transactional history recording

const db = require("../config/db");
const outpassRepository = require("../repositories/outpassRepository");
const statusHistoryRepository = require("../repositories/statusHistoryRepository");

class ApprovalService {
  /**
   * Process an outpass review decision (APPROVE or REJECT)
   * Executes status update and history insertion in an atomic transaction
   * 
   * @param {Object} params
   * @param {string} params.outpassId - Outpass ID (e.g. 'OP-2026-001')
   * @param {string} params.action - 'APPROVE' or 'REJECT'
   * @param {string} [params.remarks] - Warden comments / notes
   * @param {string} [params.rejectionReason] - Mandatory reason if rejecting
   * @param {Object} params.wardenUser - Verified warden user object from auth middleware
   * @returns {Promise<Object>} Updated outpass and created status history record
   */
  async processDecision({
    outpassId,
    action,
    remarks = "",
    rejectionReason = null,
    wardenUser
  }) {
    if (!outpassId || typeof outpassId !== "string" || !outpassId.trim()) {
      const error = new Error("Invalid or missing Outpass ID");
      error.statusCode = 400;
      throw error;
    }

    const normalizedAction = (action || "").toUpperCase();
    if (!["APPROVE", "REJECT"].includes(normalizedAction)) {
      const error = new Error(`Invalid review action '${action}'. Action must be either 'APPROVE' or 'REJECT'.`);
      error.statusCode = 400;
      throw error;
    }

    const targetStatus = normalizedAction === "APPROVE" ? "APPROVED" : "REJECTED";

    // For rejection, validate mandatory rejection reason
    const trimmedReason = (rejectionReason || "").trim();
    if (normalizedAction === "REJECT" && !trimmedReason) {
      const error = new Error("A specific rejection reason is mandatory when denying an outpass request.");
      error.statusCode = 400;
      throw error;
    }

    // Verify authorized warden
    if (!wardenUser || !wardenUser.id || wardenUser.role !== "WARDEN") {
      const error = new Error("Unauthorized: Only an authorized hostel warden can perform this action.");
      error.statusCode = 403;
      throw error;
    }

    const executeOperation = async (client = null) => {
      // 1. Fetch current outpass (with row lock if in PostgreSQL)
      const outpass = await outpassRepository.findById(outpassId, client, true);
      if (!outpass) {
        const error = new Error(`Outpass request with ID '${outpassId}' was not found.`);
        error.statusCode = 404;
        throw error;
      }

      // 2. Validate state transition: outpass must be in 'PENDING' status
      if (outpass.status !== "PENDING") {
        const error = new Error(
          `Invalid status transition: Outpass '${outpassId}' is already ${outpass.status}. ` +
          `Only requests in 'PENDING' status can be approved or rejected.`
        );
        error.statusCode = 400;
        throw error;
      }

      const previousStatus = outpass.status;

      // 3. Update outpass request status
      const updatedOutpass = await outpassRepository.updateStatus(
        outpassId,
        {
          status: targetStatus,
          wardenRemarks: remarks.trim() || (normalizedAction === "APPROVE" ? "Approved by warden" : null),
          rejectionReason: normalizedAction === "REJECT" ? trimmedReason : null,
          approvedBy: normalizedAction === "APPROVE" ? wardenUser.id : null
        },
        client
      );

      // 4. Record status transition in Outpass Status History (MODULE 1)
      const historyEntry = await statusHistoryRepository.createHistoryEntry(
        {
          outpassId: outpassId,
          previousStatus: previousStatus,
          newStatus: targetStatus,
          changedBy: wardenUser.id,
          changedByRole: wardenUser.role,
          remarks: remarks.trim() || null,
          rejectionReason: normalizedAction === "REJECT" ? trimmedReason : null
        },
        client
      );

      // Keep outpassStore in sync for dashboard counts and student views
      try {
        const { outpassStore } = require("../db/outpassStore");
        outpassStore.updateStatus(outpassId, {
          status: targetStatus,
          wardenRemarks: remarks.trim() || (normalizedAction === "APPROVE" ? "Approved by warden" : null),
          reviewedBy: wardenUser.name || wardenUser.id
        });
      } catch (storeErr) {
        // Silently continue if record not in store
      }

      return {
        outpass: updatedOutpass,
        historyEntry: historyEntry
      };
    };

    // Execute within transaction if PostgreSQL is connected
    if (db.isPostgresConnected()) {
      return db.withTransaction(async (client) => executeOperation(client));
    } else {
      return executeOperation(null);
    }
  }

  /**
   * Retrieves the full chronological status history for an outpass
   * @param {string} outpassId
   */
  async getStatusHistory(outpassId) {
    if (!outpassId) {
      const error = new Error("Outpass ID is required");
      error.statusCode = 400;
      throw error;
    }

    // Verify outpass exists
    const outpass = await outpassRepository.findById(outpassId);
    if (!outpass) {
      const error = new Error(`Outpass request with ID '${outpassId}' not found.`);
      error.statusCode = 404;
      throw error;
    }

    const history = await statusHistoryRepository.getHistoryByOutpassId(outpassId);
    return {
      outpassId,
      currentStatus: outpass.status,
      historyCount: history.length,
      history
    };
  }
}

module.exports = new ApprovalService();
