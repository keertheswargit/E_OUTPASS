/**
 * E-Outpass Management System
 * SCRUM06B-F002-UI-001: Warden Pending Requests Review Dashboard
 * Frontend Application Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // App State
  // ==========================================
  const state = {
    currentView: "PENDING", // "PENDING" or "ALL"
    filterBlock: "ALL",
    filterType: "ALL",
    searchQuery: "",
    requests: [],
    stats: null,
    selectedRequest: null
  };

  // ==========================================
  // DOM Elements
  // ==========================================
  const el = {
    liveClock: document.getElementById("liveClock"),
    kpiPending: document.getElementById("kpiPending"),
    kpiUrgentSub: document.getElementById("kpiUrgentSub"),
    kpiApproved: document.getElementById("kpiApproved"),
    kpiOutside: document.getElementById("kpiOutside"),
    kpiRejected: document.getElementById("kpiRejected"),
    tabPending: document.getElementById("tabPending"),
    tabAll: document.getElementById("tabAll"),
    tabPendingCount: document.getElementById("tabPendingCount"),
    tabAllCount: document.getElementById("tabAllCount"),
    searchInput: document.getElementById("searchInput"),
    btnClearSearch: document.getElementById("btnClearSearch"),
    blockFilter: document.getElementById("blockFilter"),
    typeFilter: document.getElementById("typeFilter"),
    btnRefresh: document.getElementById("btnRefresh"),
    btnResetSeed: document.getElementById("btnResetSeed"),
    outpassTable: document.getElementById("outpassTable"),
    outpassTableBody: document.getElementById("outpassTableBody"),
    emptyState: document.getElementById("emptyState"),
    emptyStateMsg: document.getElementById("emptyStateMsg"),
    btnEmptyReset: document.getElementById("btnEmptyReset"),
    showingCountText: document.getElementById("showingCountText"),
    toastContainer: document.getElementById("toastContainer"),

    // Review Modal
    reviewModal: document.getElementById("reviewModal"),
    btnCloseReviewModal: document.getElementById("btnCloseReviewModal"),
    btnCancelModal: document.getElementById("btnCancelModal"),
    modalRequestId: document.getElementById("modalRequestId"),
    modalTypeBadge: document.getElementById("modalTypeBadge"),
    modalStatusBadge: document.getElementById("modalStatusBadge"),
    modalAvatar: document.getElementById("modalAvatar"),
    modalStudentName: document.getElementById("modalStudentName"),
    modalRollNo: document.getElementById("modalRollNo"),
    modalDept: document.getElementById("modalDept"),
    modalBlockRoom: document.getElementById("modalBlockRoom"),
    modalPhone: document.getElementById("modalPhone"),
    modalHistPasses: document.getElementById("modalHistPasses"),
    modalHistAttendance: document.getElementById("modalHistAttendance"),
    modalHistCgpa: document.getElementById("modalHistCgpa"),
    modalHistOverstays: document.getElementById("modalHistOverstays"),
    modalDestination: document.getElementById("modalDestination"),
    modalDepTime: document.getElementById("modalDepTime"),
    modalRetTime: document.getElementById("modalRetTime"),
    modalDuration: document.getElementById("modalDuration"),
    modalReason: document.getElementById("modalReason"),
    modalParentName: document.getElementById("modalParentName"),
    modalParentPhone: document.getElementById("modalParentPhone"),
    btnCallParent: document.getElementById("btnCallParent"),
    btnToggleConsent: document.getElementById("btnToggleConsent"),
    modalConsentBanner: document.getElementById("modalConsentBanner"),
    modalConsentText: document.getElementById("modalConsentText"),
    wardenRemarksInput: document.getElementById("wardenRemarksInput"),
    btnRejectOutpass: document.getElementById("btnRejectOutpass"),
    btnApproveOutpass: document.getElementById("btnApproveOutpass"),
    rejectionPresets: document.querySelectorAll(".btn-preset"),

    // Pass Modal
    passModal: document.getElementById("passModal"),
    btnClosePassModal: document.getElementById("btnClosePassModal"),
    btnClosePassModalBtn: document.getElementById("btnClosePassModalBtn"),
    btnPrintPass: document.getElementById("btnPrintPass"),
    passTokenCode: document.getElementById("passTokenCode"),
    passStudentName: document.getElementById("passStudentName"),
    passRollNo: document.getElementById("passRollNo"),
    passHostelRoom: document.getElementById("passHostelRoom"),
    passDestination: document.getElementById("passDestination"),
    passDepWindow: document.getElementById("passDepWindow"),
    passRetWindow: document.getElementById("passRetWindow"),
    passRemarks: document.getElementById("passRemarks"),
    passWarden: document.getElementById("passWarden"),
    passTimestamp: document.getElementById("passTimestamp"),

    // Simulator Modal
    btnOpenSimulator: document.getElementById("btnOpenSimulator"),
    simulatorModal: document.getElementById("simulatorModal"),
    btnCloseSimulatorModal: document.getElementById("btnCloseSimulatorModal"),
    btnCancelSimulator: document.getElementById("btnCancelSimulator"),
    simulatorForm: document.getElementById("simulatorForm"),
    simDepTime: document.getElementById("simDepTime"),
    simRetTime: document.getElementById("simRetTime")
  };

  // ==========================================
  // Modern Web Guidance: Light-Dismiss Dialog Fallback
  // ==========================================
  function setupDialogLightDismiss(dialog) {
    if (!dialog) return;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }

  [el.reviewModal, el.passModal, el.simulatorModal].forEach(setupDialogLightDismiss);

  // ==========================================
  // Live Header Clock
  // ==========================================
  function updateLiveClock() {
    const now = new Date();
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    };
    if (el.liveClock) {
      el.liveClock.textContent = now.toLocaleDateString("en-US", options);
    }
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // ==========================================
  // Formatters & Utility Helpers
  // ==========================================
  function formatDateTime(isoString) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  function calculateDuration(startIso, endIso) {
    if (!startIso || !endIso) return "-";
    const start = new Date(startIso);
    const end = new Date(endIso);
    const diffMs = end - start;
    if (diffMs <= 0) return "0 mins";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  function getInitials(name) {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function getTypeBadge(type) {
    switch (type) {
      case "DAY_PASS":
        return `<span class="badge-type badge-day">Day Pass</span>`;
      case "WEEKEND_PASS":
        return `<span class="badge-type badge-weekend">Weekend Pass</span>`;
      case "EMERGENCY_PASS":
        return `<span class="badge-type badge-emergency">🚨 Emergency Pass</span>`;
      case "VACATION_PASS":
        return `<span class="badge-type badge-vacation">Vacation Pass</span>`;
      default:
        return `<span class="badge-type badge-day">${type || "Pass"}</span>`;
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "APPROVED":
        return `<span class="status-badge approved">✔ Approved</span>`;
      case "REJECTED":
        return `<span class="status-badge rejected">✖ Rejected</span>`;
      case "PENDING":
        return `<span class="status-badge pending">⏳ Pending</span>`;
      default:
        return `<span class="status-badge">${status}</span>`;
    }
  }

  function isUrgentDeparture(departureTimeIso) {
    const depTime = new Date(departureTimeIso).getTime();
    const now = Date.now();
    const threeHours = 3 * 3600 * 1000;
    return depTime > now && depTime <= now + threeHours;
  }

  // Toast System
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === "success" ? "✔" : type === "error" ? "✖" : "ℹ"}</span>
      <span>${message}</span>
    `;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s";
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ==========================================
  // API Calls
  // ==========================================
  async function fetchStats() {
    try {
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (json.success) {
        state.stats = json.data;
        updateKpiDisplay(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }

  function updateKpiDisplay(stats) {
    el.kpiPending.textContent = stats.pendingCount ?? 0;
    el.kpiApproved.textContent = stats.approvedToday ?? 0;
    el.kpiOutside.textContent = stats.currentlyOutside ?? 0;
    el.kpiRejected.textContent = stats.rejectedToday ?? 0;

    el.tabPendingCount.textContent = stats.pendingCount ?? 0;
    el.tabAllCount.textContent = stats.totalRequests ?? 0;

    if (stats.urgentPending > 0) {
      el.kpiUrgentSub.innerHTML = `<span class="red-text font-bold">🚨 ${stats.urgentPending} departing in &lt; 3h</span>`;
    } else {
      el.kpiUrgentSub.textContent = "All queues normal";
    }
  }

  async function fetchRequests() {
    try {
      const params = new URLSearchParams();
      if (state.currentView === "PENDING") {
        params.append("status", "PENDING");
      }
      if (state.filterBlock !== "ALL") {
        params.append("hostelBlock", state.filterBlock);
      }
      if (state.filterType !== "ALL") {
        params.append("outpassType", state.filterType);
      }
      if (state.searchQuery.trim()) {
        params.append("search", state.searchQuery.trim());
      }

      const endpoint = state.currentView === "PENDING"
        ? `/api/outpasses/pending?${params.toString()}`
        : `/api/outpasses?${params.toString()}`;

      const res = await fetch(endpoint);
      const json = await res.json();

      if (json.success) {
        state.requests = json.data;
        renderTable(json.data);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
      el.outpassTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="loading-state">
            <span class="red-text">Error loading requests. Please check backend server.</span>
          </td>
        </tr>
      `;
    }
  }

  async function updateOutpassStatus(id, status, wardenRemarks) {
    try {
      const res = await fetch(`/api/outpasses/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          wardenRemarks,
          reviewedBy: "Chief Warden Dr. R. Sundaram"
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Outpass ${id} has been ${status.toLowerCase()}!`, "success");
        if (el.reviewModal.open) el.reviewModal.close();
        await fetchStats();
        await fetchRequests();

        // If approved, prompt option to view gate pass
        if (status === "APPROVED") {
          openPassModal(json.data);
        }
      } else {
        showToast(json.error || "Failed to update outpass", "error");
      }
    } catch (err) {
      showToast("Network error while updating outpass", "error");
    }
  }

  // ==========================================
  // Render Pending & History Table
  // ==========================================
  function renderTable(records) {
    if (!records || records.length === 0) {
      el.outpassTableBody.innerHTML = "";
      el.emptyState.classList.remove("hidden");
      el.outpassTable.classList.add("hidden");
      el.showingCountText.textContent = "Showing 0 requests";
      return;
    }

    el.emptyState.classList.add("hidden");
    el.outpassTable.classList.remove("hidden");
    el.showingCountText.textContent = `Showing ${records.length} ${records.length === 1 ? "request" : "requests"}`;

    el.outpassTableBody.innerHTML = records.map(req => {
      const isUrgent = req.status === "PENDING" && isUrgentDeparture(req.departureTime);
      const isEmergency = req.outpassType === "EMERGENCY_PASS";
      const rowClass = isEmergency ? "urgent-row" : isUrgent ? "urgent-row" : "";
      const initials = getInitials(req.studentName);
      const duration = calculateDuration(req.departureTime, req.expectedReturnTime);

      const parentConsentBadge = req.parentConsent === "VERIFIED" || req.parentConsent === "CONFIRMED_VIA_SMS"
        ? `<span class="consent-badge consent-verified">✔ Consent Verified</span>`
        : `<span class="consent-badge consent-pending">📞 Pending Verification</span>`;

      return `
        <tr class="${rowClass}" data-id="${req.id}">
          <!-- Request ID & Type -->
          <td>
            <div class="req-id-col">
              <span class="req-id">${req.id}</span>
              ${getTypeBadge(req.outpassType)}
            </div>
          </td>

          <!-- Student Details -->
          <td>
            <div class="student-col">
              <div class="student-avatar">${initials}</div>
              <div class="student-info">
                <span class="student-name-text">${req.studentName}</span>
                <span class="student-meta-sub">${req.studentId} • ${req.department ? req.department.split(' ')[0] : 'Engg'}</span>
              </div>
            </div>
          </td>

          <!-- Room & Block -->
          <td>
            <div class="room-col">
              <span class="room-no">Room ${req.roomNumber}</span>
              <span class="block-name">${req.hostelBlock}</span>
            </div>
          </td>

          <!-- Destination & Purpose -->
          <td>
            <div class="dest-col">
              <div class="dest-place">${req.destination}</div>
              <div class="dest-reason" title="${req.reason}">${req.reason}</div>
            </div>
          </td>

          <!-- Departure & Return Window -->
          <td>
            <div class="time-col">
              <div class="time-row">
                <span class="time-lbl">OUT:</span>
                <span>${formatDateTime(req.departureTime)}</span>
              </div>
              <div class="time-row">
                <span class="time-lbl">IN:</span>
                <span class="bold">${formatDateTime(req.expectedReturnTime)}</span>
              </div>
              <div class="time-duration-chip">⏱ ${duration} duration</div>
            </div>
          </td>

          <!-- Parent Contact & Consent -->
          <td>
            <div class="parent-col">
              <span class="parent-name-text">${req.parentName}</span>
              <a href="tel:${req.parentPhone}" class="parent-phone-link" title="Call parent to verify">
                📞 ${req.parentPhone}
              </a>
              ${parentConsentBadge}
            </div>
          </td>

          <!-- Decision / Action Buttons -->
          <td>
            <div class="action-btn-group">
              ${req.status === "PENDING" ? `
                <button class="btn btn-sm btn-primary btn-review" data-id="${req.id}" title="Inspect full profile & review">
                  <span>Review & Verify</span>
                </button>
                <button class="btn-action-icon approve btn-quick-approve" data-id="${req.id}" title="Quick Approve">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button class="btn-action-icon reject btn-quick-reject" data-id="${req.id}" title="Reject with Reason">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              ` : `
                ${getStatusBadge(req.status)}
                ${req.status === "APPROVED" ? `
                  <button class="btn btn-sm btn-outline btn-view-pass" data-id="${req.id}" title="View Gate Pass">
                    🎟 View Pass
                  </button>
                ` : `
                  <button class="btn btn-sm btn-outline btn-review" data-id="${req.id}" title="View Details">
                    Details
                  </button>
                `}
              `}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    attachTableEventListeners();
  }

  // ==========================================
  // Table Row Action Handlers
  // ==========================================
  function attachTableEventListeners() {
    // Review button
    document.querySelectorAll(".btn-review").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openReviewModal(id);
      });
    });

    // Quick Approve
    document.querySelectorAll(".btn-quick-approve").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm(`Are you sure you want to approve outpass ${id}?`)) {
          updateOutpassStatus(id, "APPROVED", "Approved via Quick Action. Comply with hostel reporting hours.");
        }
      });
    });

    // Quick Reject
    document.querySelectorAll(".btn-quick-reject").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openReviewModal(id, true); // Opens modal with focus on rejection
      });
    });

    // View Gate Pass
    document.querySelectorAll(".btn-view-pass").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const record = state.requests.find(r => r.id === id);
        if (record) openPassModal(record);
      });
    });
  }

  // ==========================================
  // Detailed Review Modal
  // ==========================================
  function openReviewModal(requestId, focusReject = false) {
    const req = state.requests.find(r => r.id === requestId);
    if (!req) return;

    state.selectedRequest = req;

    // Header badges
    el.modalRequestId.textContent = req.id;
    el.modalTypeBadge.textContent = req.outpassType.replace("_", " ");
    el.modalStatusBadge.textContent = req.status;

    // Student Info
    el.modalAvatar.textContent = getInitials(req.studentName);
    el.modalStudentName.textContent = req.studentName;
    el.modalRollNo.textContent = `Roll: ${req.studentId}`;
    el.modalDept.textContent = `${req.department} • ${req.year}`;
    el.modalBlockRoom.textContent = `${req.hostelBlock} • Room ${req.roomNumber}`;
    el.modalPhone.textContent = `📞 ${req.studentPhone}`;

    // History & Discipline
    const hist = req.studentHistory || {};
    el.modalHistPasses.textContent = hist.totalOutpassesThisSem ?? "1";
    el.modalHistAttendance.textContent = hist.attendance ?? "92%";
    el.modalHistCgpa.textContent = hist.cgpa ?? "8.50";
    el.modalHistOverstays.textContent = hist.overstays ?? "0";

    // Schedule
    el.modalDestination.textContent = req.destination;
    el.modalDepTime.textContent = formatDateTime(req.departureTime);
    el.modalRetTime.textContent = formatDateTime(req.expectedReturnTime);
    el.modalDuration.textContent = calculateDuration(req.departureTime, req.expectedReturnTime);
    el.modalReason.textContent = req.reason;

    // Parent Section
    el.modalParentName.textContent = req.parentName;
    el.modalParentPhone.textContent = req.parentPhone;
    el.btnCallParent.href = `tel:${req.parentPhone}`;

    updateConsentUI(req.parentConsent);

    // Remarks reset
    el.wardenRemarksInput.value = req.wardenRemarks || "";

    // Show modal using native showModal()
    el.reviewModal.showModal();

    if (focusReject) {
      el.wardenRemarksInput.focus();
      el.wardenRemarksInput.placeholder = "Please select or type the specific reason for rejecting this outpass...";
    }
  }

  function updateConsentUI(consent) {
    if (consent === "VERIFIED" || consent === "CONFIRMED_VIA_SMS") {
      el.modalConsentBanner.style.backgroundColor = "var(--success-light)";
      el.modalConsentBanner.style.color = "#065f46";
      el.modalConsentText.textContent = "✔ Parent / guardian consent confirmed & logged in audit record.";
      el.btnToggleConsent.textContent = "Reset Consent Status";
    } else {
      el.modalConsentBanner.style.backgroundColor = "var(--warning-light)";
      el.modalConsentBanner.style.color = "#b45309";
      el.modalConsentText.textContent = "⚠️ Parent consent pending verification. Please call guardian before approving.";
      el.btnToggleConsent.textContent = "✔ Mark Consent Confirmed";
    }
  }

  // Toggle Consent Status
  el.btnToggleConsent.addEventListener("click", () => {
    if (!state.selectedRequest) return;
    const isCurrentlyVerified = state.selectedRequest.parentConsent === "VERIFIED";
    state.selectedRequest.parentConsent = isCurrentlyVerified ? "PENDING_CALL" : "VERIFIED";
    updateConsentUI(state.selectedRequest.parentConsent);
    showToast(
      isCurrentlyVerified
        ? "Parent consent status marked as Pending Verification"
        : "Parent consent marked as Confirmed!",
      "info"
    );
  });

  // Rejection Preset Buttons
  el.rejectionPresets.forEach(btn => {
    btn.addEventListener("click", () => {
      const reason = btn.getAttribute("data-reason");
      el.wardenRemarksInput.value = reason;
      el.wardenRemarksInput.focus();
    });
  });

  // Approve in Modal
  el.btnApproveOutpass.addEventListener("click", () => {
    if (!state.selectedRequest) return;
    const remarks = el.wardenRemarksInput.value.trim() || "Approved by Chief Warden. Follow campus security rules.";
    updateOutpassStatus(state.selectedRequest.id, "APPROVED", remarks);
  });

  // Reject in Modal
  el.btnRejectOutpass.addEventListener("click", () => {
    if (!state.selectedRequest) return;
    const remarks = el.wardenRemarksInput.value.trim();
    if (!remarks) {
      alert("Please provide a reason or select a preset for rejecting this outpass request.");
      el.wardenRemarksInput.focus();
      return;
    }
    updateOutpassStatus(state.selectedRequest.id, "REJECTED", remarks);
  });

  // Close Review Modal
  el.btnCloseReviewModal.addEventListener("click", () => el.reviewModal.close());
  el.btnCancelModal.addEventListener("click", () => el.reviewModal.close());

  // ==========================================
  // Digital Gate Outpass Modal
  // ==========================================
  function openPassModal(record) {
    el.passTokenCode.textContent = record.gatePassToken || "EOP-SEC-8921";
    el.passStudentName.textContent = record.studentName;
    el.passRollNo.textContent = record.studentId;
    el.passHostelRoom.textContent = `${record.hostelBlock} • Room ${record.roomNumber}`;
    el.passDestination.textContent = record.destination;
    el.passDepWindow.textContent = formatDateTime(record.departureTime);
    el.passRetWindow.textContent = formatDateTime(record.expectedReturnTime);
    el.passRemarks.textContent = record.wardenRemarks || "Approved. Return safely before gate closing.";
    el.passWarden.textContent = record.reviewedBy || "Chief Warden Dr. R. Sundaram";
    el.passTimestamp.textContent = `Authorized: ${formatDateTime(record.reviewedAt || record.updatedAt)}`;

    el.passModal.showModal();
  }

  el.btnClosePassModal.addEventListener("click", () => el.passModal.close());
  el.btnClosePassModalBtn.addEventListener("click", () => el.passModal.close());
  el.btnPrintPass.addEventListener("click", () => window.print());

  // ==========================================
  // Student Request Simulator Modal
  // ==========================================
  el.btnOpenSimulator.addEventListener("click", () => {
    // Populate sensible default departure and return times
    const now = new Date();
    const dep = new Date(now.getTime() + 1.5 * 3600 * 1000); // 1.5 hours from now
    const ret = new Date(now.getTime() + 6 * 3600 * 1000); // 6 hours from now

    // Format for datetime-local (YYYY-MM-DDTHH:mm)
    const toIsoLocal = (d) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    el.simDepTime.value = toIsoLocal(dep);
    el.simRetTime.value = toIsoLocal(ret);

    el.simulatorModal.showModal();
  });

  el.btnCloseSimulatorModal.addEventListener("click", () => el.simulatorModal.close());
  el.btnCancelSimulator.addEventListener("click", () => el.simulatorModal.close());

  el.simulatorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      studentId: document.getElementById("simRollNo").value.trim(),
      studentName: document.getElementById("simStudentName").value.trim(),
      department: document.getElementById("simDepartment").value.trim(),
      hostelBlock: document.getElementById("simHostelBlock").value,
      roomNumber: document.getElementById("simRoomNo").value.trim(),
      outpassType: document.getElementById("simOutpassType").value,
      destination: document.getElementById("simDestination").value.trim(),
      departureTime: new Date(el.simDepTime.value).toISOString(),
      expectedReturnTime: new Date(el.simRetTime.value).toISOString(),
      reason: document.getElementById("simReason").value.trim(),
      parentName: document.getElementById("simParentName").value.trim(),
      parentPhone: document.getElementById("simParentPhone").value.trim(),
      parentConsent: "PENDING_CALL"
    };

    try {
      const res = await fetch("/api/outpasses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        showToast(`Request submitted! Outpass ID: ${json.data.id}`, "success");
        el.simulatorModal.close();

        // Switch to Pending view and reload
        state.currentView = "PENDING";
        updateTabStyles();
        await fetchStats();
        await fetchRequests();
      } else {
        alert(json.error || "Failed to submit student request");
      }
    } catch (err) {
      alert("Error submitting request to server");
    }
  });

  // ==========================================
  // Filter & Search Event Listeners
  // ==========================================
  let debounceTimeout = null;
  el.searchInput.addEventListener("input", (e) => {
    const val = e.target.value;
    if (val.length > 0) {
      el.btnClearSearch.classList.remove("hidden");
    } else {
      el.btnClearSearch.classList.add("hidden");
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      state.searchQuery = val;
      fetchRequests();
    }, 250);
  });

  el.btnClearSearch.addEventListener("click", () => {
    el.searchInput.value = "";
    el.btnClearSearch.classList.add("hidden");
    state.searchQuery = "";
    fetchRequests();
  });

  el.blockFilter.addEventListener("change", (e) => {
    state.filterBlock = e.target.value;
    fetchRequests();
  });

  el.typeFilter.addEventListener("change", (e) => {
    state.filterType = e.target.value;
    fetchRequests();
  });

  el.btnRefresh.addEventListener("click", () => {
    fetchStats();
    fetchRequests();
    showToast("Dashboard refreshed", "info");
  });

  el.btnResetSeed.addEventListener("click", async () => {
    if (confirm("Reset outpass records back to initial college seed data?")) {
      try {
        const res = await fetch("/api/reset-seed", { method: "POST" });
        const json = await res.json();
        if (json.success) {
          showToast(json.message, "success");
          fetchStats();
          fetchRequests();
        }
      } catch (err) {
        showToast("Failed to reset database", "error");
      }
    }
  });

  el.btnEmptyReset.addEventListener("click", () => {
    el.searchInput.value = "";
    el.btnClearSearch.classList.add("hidden");
    state.searchQuery = "";
    state.filterBlock = "ALL";
    state.filterType = "ALL";
    el.blockFilter.value = "ALL";
    el.typeFilter.value = "ALL";
    fetchRequests();
  });

  // Tabs (Pending Queue vs All History)
  function updateTabStyles() {
    if (state.currentView === "PENDING") {
      el.tabPending.classList.add("active");
      el.tabAll.classList.remove("active");
    } else {
      el.tabAll.classList.add("active");
      el.tabPending.classList.remove("active");
    }
  }

  el.tabPending.addEventListener("click", () => {
    state.currentView = "PENDING";
    updateTabStyles();
    fetchRequests();
  });

  el.tabAll.addEventListener("click", () => {
    state.currentView = "ALL";
    updateTabStyles();
    fetchRequests();
  });

  // ==========================================
  // Initialize Dashboard
  // ==========================================
  fetchStats();
  fetchRequests();

  // Auto-refresh stats every 30 seconds
  setInterval(fetchStats, 30000);
});
