<<<<<<< HEAD
const API_BASE = "http://127.0.0.1:8000";
const studentId = "2024506050";

let historyData = [];
let lastKnownStatus = localStorage.getItem(`last_status_${studentId}`) || null;
let currentQrToken = null;

// Date & Time Formatter
function formatDateTime(dateTime) {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return dateTime;
=======
let historyData = [];
const studentId = "2024506050";


function formatDateTime(dateTime) {
    const date = new Date(dateTime);

>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

<<<<<<< HEAD
// -------------------------------------------------------------
// Toast Notification System (SCRUM06B-F004-UI-001)
// -------------------------------------------------------------
function showToast(title, message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "🔔";
    if (type === "approved" || type === "success") icon = "✅";
    if (type === "rejected" || type === "error") icon = "❌";

    toast.innerHTML = `
        <div style="font-size: 20px;">${icon}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <p class="toast-desc">${message}</p>
        </div>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;

    toast.querySelector(".toast-close").addEventListener("click", () => {
        toast.remove();
    });

    container.appendChild(toast);

    // Auto-remove after 6 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(50px)";
            toast.style.transition = "all 0.3s";
            setTimeout(() => toast.remove(), 300);
        }
    }, 6000);
}

// -------------------------------------------------------------
// Notifications API (SCRUM06B-F004-UI-001 & BE-001)
// -------------------------------------------------------------
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/api/notifications/my?student_id=${studentId}`);
        if (!response.ok) return;

        const notifications = await response.json();
        const unreadList = notifications.filter(n => !n.is_read);
        const badge = document.getElementById("notif-badge");

        if (unreadList.length > 0) {
            badge.textContent = unreadList.length;
            badge.style.display = "flex";
        } else {
            badge.style.display = "none";
        }

        renderNotificationList(notifications);
    } catch (err) {
        console.warn("Could not fetch notifications:", err);
    }
}

function renderNotificationList(notifications) {
    const listEl = document.getElementById("notif-list");
    if (!listEl) return;

    if (!notifications || notifications.length === 0) {
        listEl.innerHTML = '<p class="empty-notif">No notifications yet.</p>';
        return;
    }

    listEl.innerHTML = notifications.map(notif => `
        <div class="notif-item ${notif.is_read ? '' : 'unread'}" data-id="${notif._id || notif.id}">
            <p class="notif-item-msg">
                <strong>${notif.notification_type === 'OUTPASS_APPROVED' ? 'Approved:' : notif.notification_type === 'OUTPASS_REJECTED' ? 'Rejected:' : 'Update:'}</strong>
                ${notif.message}
            </p>
            <span class="notif-item-time">${formatDateTime(notif.created_at)}</span>
        </div>
    `).join("");

    // Click on individual notification to mark read
    listEl.querySelectorAll(".notif-item.unread").forEach(item => {
        item.addEventListener("click", async () => {
            const notifId = item.getAttribute("data-id");
            if (notifId) {
                await fetch(`${API_BASE}/api/notifications/${notifId}/read`, { method: "PUT" });
                loadNotifications();
            }
        });
    });
}

// Toggle notification dropdown
document.getElementById("notif-bell-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById("notif-dropdown");
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    }
});

// Close dropdown on outside click
document.addEventListener("click", () => {
    const dropdown = document.getElementById("notif-dropdown");
    if (dropdown) dropdown.style.display = "none";
});

document.getElementById("notif-dropdown")?.addEventListener("click", (e) => {
    e.stopPropagation();
});

// Mark all as read
document.getElementById("mark-all-read-btn")?.addEventListener("click", async () => {
    try {
        await fetch(`${API_BASE}/api/notifications/my/read-all?student_id=${studentId}`, { method: "PUT" });
        loadNotifications();
    } catch (err) {
        console.error("Failed to mark all read:", err);
    }
});

// -------------------------------------------------------------
// SVG QR Code Generator (SCRUM06B-F005-UI-001)
// Pure client-side offline SVG QR Matrix renderer
// -------------------------------------------------------------
function generateQrSvg(tokenText) {
    // Generate deterministic 21x21 QR Code matrix from token hash
    const size = 21;
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));

    // Helper: draw standard QR finder pattern (7x7)
    function drawFinder(row, col) {
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                if (
                    r === 0 || r === 6 || c === 0 || c === 6 ||
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4)
                ) {
                    matrix[row + r][col + c] = 1;
                }
            }
        }
    }

    // Three standard finder patterns
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
        matrix[6][i] = i % 2 === 0 ? 1 : 0;
        matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Fill data cells using token string hash
    let hash = 0;
    for (let i = 0; i < tokenText.length; i++) {
        hash = (hash * 31 + tokenText.charCodeAt(i)) >>> 0;
    }

    let bitIndex = 0;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            // Skip finder patterns
            if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) {
                continue;
            }
            if (r === 6 || c === 6) continue;

            const bit = ((hash ^ (r * 17 + c * 23 + bitIndex)) >> (bitIndex % 16)) & 1;
            matrix[r][c] = bit;
            bitIndex++;
        }
    }

    // Build SVG
    const cellSize = 6;
    const svgDim = size * cellSize;
    let rects = "";
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (matrix[r][c] === 1) {
                rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#111827" />`;
            }
        }
    }

    return `
        <svg class="qr-code-svg" viewBox="0 0 ${svgDim} ${svgDim}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${svgDim}" height="${svgDim}" fill="#ffffff" />
            ${rects}
        </svg>
    `;
}

// -------------------------------------------------------------
// Load Student Outpasses (SCRUM06B-F003)
// -------------------------------------------------------------
async function loadOutpasses() {
    try {
        const response = await fetch(`${API_BASE}/api/outpasses/my?student_id=${studentId}`);
=======

async function loadOutpasses() {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/outpasses/my?student_id=${studentId}`
        );

>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
        if (!response.ok) {
            throw new Error("Failed to load outpasses");
        }

        const data = await response.json();

<<<<<<< HEAD
        // Check for status change toast alert (SCRUM06B-F004-UI-001)
        checkStatusChangeToast(data.current);

        displayCurrent(data.current);
        displayHistory(data.history);

        // Also refresh notifications
        loadNotifications();

    } catch (error) {
        document.getElementById("current-outpass").innerHTML =
            `<p style="color: #dc2626;">Unable to load outpass details. Please ensure backend server is running.</p>`;
        document.getElementById("history-container").innerHTML =
            `<p style="color: #dc2626;">Unable to load history.</p>`;
=======
        displayCurrent(data.current);
        displayHistory(data.history);

    } catch (error) {
        document.getElementById("current-outpass").innerHTML =
            "<p>Unable to load outpass details.</p>";

        document.getElementById("history-container").innerHTML =
            "<p>Unable to load history.</p>";

>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
        console.error(error);
    }
}

<<<<<<< HEAD
function checkStatusChangeToast(current) {
    if (!current) return;

    const newStatus = current.status;
    if (lastKnownStatus && lastKnownStatus !== newStatus) {
        if (newStatus === "APPROVED") {
            showToast("Outpass Approved! 🎉", `Your request to ${current.destination} has been APPROVED by the warden. Your digital QR gate pass is ready.`, "approved");
        } else if (newStatus === "REJECTED") {
            showToast("Outpass Rejected", `Your request to ${current.destination} was rejected. Remarks: ${current.warden_remarks || "None"}`, "rejected");
        }
    }

    lastKnownStatus = newStatus;
    localStorage.setItem(`last_status_${studentId}`, newStatus);
}

// Display Current Outpass Card
=======

>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
function displayCurrent(outpass) {
    const container = document.getElementById("current-outpass");

    if (!outpass) {
<<<<<<< HEAD
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #6b7280;">
                <p>No active outpass request.</p>
                <p style="font-size: 13px;">Submit a new request below when you plan to travel.</p>
            </div>
        `;
        currentQrToken = null;
        return;
    }

    const isApproved = outpass.status === "APPROVED";
    const emergencyContact = outpass.emergency_contact || outpass.parent_contact || "N/A";
    currentQrToken = outpass.qr_code_token || null;

    let qrPassHtml = "";
    if (isApproved && outpass.qr_code_token) {
        qrPassHtml = `
            <div class="qr-pass-container">
                <div class="qr-code-box">
                    ${generateQrSvg(outpass.qr_code_token)}
                    <span style="font-size: 10px; color: #15803d; font-weight: 700; margin-top: 6px;">DIGITAL GATE PASS</span>
                </div>
                <div class="qr-pass-info">
                    <div class="qr-pass-title">Approved Outpass QR Code</div>
                    <p class="qr-pass-note">Present this QR code to security staff at the hostel gate for entry/exit scanning.</p>
                    <div>Token: <span class="qr-token-display">${outpass.qr_code_token}</span></div>
                    <div>
                        <button id="copy-token-btn" class="secondary-btn" style="font-size: 12px;">Copy Token to Gate Staff Portal</button>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="outpass-grid">
            <div class="detail-item">
                <div class="detail-label">Destination</div>
                <div class="detail-value">${outpass.destination}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Reason</div>
                <div class="detail-value">${outpass.reason}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Departure Time</div>
                <div class="detail-value">${formatDateTime(outpass.departure_datetime)}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Return Time</div>
                <div class="detail-value">${formatDateTime(outpass.return_datetime)}</div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                    <span class="status status-${outpass.status}">${outpass.status}</span>
                </div>
            </div>

            <div class="detail-item">
                <div class="detail-label">Emergency Contact (SCRUM06B-F005)</div>
                <div class="detail-value">
                    <span class="emergency-pill">🚨 ${emergencyContact}</span>
                </div>
            </div>

            <div class="detail-item" style="grid-column: 1 / -1;">
                <div class="detail-label">Warden Remarks</div>
                <div class="detail-value">${outpass.warden_remarks || "Awaiting warden review"}</div>
            </div>
        </div>

        ${qrPassHtml}
    `;

    // Copy token to gate panel button
    document.getElementById("copy-token-btn")?.addEventListener("click", () => {
        if (currentQrToken) {
            const gateInput = document.getElementById("gate-qr-input");
            const gateSection = document.getElementById("gate-section");
            if (gateInput && gateSection) {
                gateInput.value = currentQrToken;
                gateSection.style.display = "block";
                gateSection.scrollIntoView({ behavior: "smooth" });
                showToast("Token Copied", "QR Token pasted into Gate Security Verification portal.", "info");
            }
        }
    });
}

// Display Outpass History Table (SCRUM06B-F003)
function displayHistory(history) {
    historyData = history || [];
    const container = document.getElementById("history-container");

    if (historyData.length === 0) {
        container.innerHTML = "<p style='color: #6b7280; padding: 12px;'>No previous outpass history.</p>";
=======
        container.innerHTML = "<p>No current outpass request.</p>";
        return;
    }

    container.innerHTML = `
        <p><strong>Destination:</strong> ${outpass.destination}</p>

        <p><strong>Reason:</strong> ${outpass.reason}</p>

        <p><strong>Departure:</strong>
            ${formatDateTime(outpass.departure_datetime)}
        </p>

        <p><strong>Return:</strong>
            ${formatDateTime(outpass.return_datetime)}
        </p>

        <p><strong>Status:</strong>
            <span class="status status-${outpass.status}">
                ${outpass.status}
            </span>
        </p>

        <p><strong>Warden Remarks:</strong>
            ${outpass.warden_remarks || "No remarks"}
        </p>
    `;
}


function displayHistory(history) {
    historyData = history;

    const container = document.getElementById("history-container");

    if (history.length === 0) {
        container.innerHTML = "<p>No previous outpass history.</p>";
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
        return;
    }

    let table = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Destination</th>
                    <th>Reason</th>
<<<<<<< HEAD
                    <th>Departure</th>
                    <th>Return</th>
                    <th>Emergency Contact</th>
=======
                    <th>Request Date</th>
                    <th>Departure</th>
                    <th>Return</th>
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
                    <th>Status</th>
                    <th>Warden Remarks</th>
                </tr>
            </thead>
<<<<<<< HEAD
            <tbody>
    `;

    historyData.forEach(outpass => {
        table += `
            <tr>
                <td><strong>${outpass.destination}</strong></td>
                <td>${outpass.reason}</td>
                <td>${formatDateTime(outpass.departure_datetime)}</td>
                <td>${formatDateTime(outpass.return_datetime)}</td>
                <td>${outpass.emergency_contact || outpass.parent_contact || "N/A"}</td>
=======

            <tbody>
    `;

    history.forEach(outpass => {
        table += `
            <tr>
                <td>${outpass.destination}</td>

                <td>${outpass.reason}</td>

                <td>
                    ${formatDateTime(outpass.request_timestamp)}
                </td>

                <td>
                    ${formatDateTime(outpass.departure_datetime)}
                </td>

                <td>
                    ${formatDateTime(outpass.return_datetime)}
                </td>

>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
                <td>
                    <span class="status status-${outpass.status}">
                        ${outpass.status}
                    </span>
                </td>
<<<<<<< HEAD
                <td>${outpass.warden_remarks || "—"}</td>
=======

                <td>
                    ${outpass.warden_remarks || "No remarks"}
                </td>
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
            </tr>
        `;
    });

<<<<<<< HEAD
    table += `</tbody></table>`;
    container.innerHTML = table;
}

// History Filters
function filterHistory() {
    const selectedStatus = document.getElementById("status-filter").value;
    const searchText = document.getElementById("search-history").value.toLowerCase();

    const filteredHistory = historyData.filter(outpass => {
        const matchesStatus = selectedStatus === "ALL" || outpass.status === selectedStatus;
        const matchesSearch =
            (outpass.destination && outpass.destination.toLowerCase().includes(searchText)) ||
            (outpass.reason && outpass.reason.toLowerCase().includes(searchText));
=======
    table += `
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

function filterHistory() {
    const selectedStatus =
        document.getElementById("status-filter").value;

    const searchText =
        document.getElementById("search-history").value.toLowerCase();

    const filteredHistory = historyData.filter(outpass => {

        const matchesStatus =
            selectedStatus === "ALL" ||
            outpass.status === selectedStatus;

        const matchesSearch =
            outpass.destination.toLowerCase().includes(searchText) ||
            outpass.reason.toLowerCase().includes(searchText);
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17

        return matchesStatus && matchesSearch;
    });

    displayHistory(filteredHistory);
}

<<<<<<< HEAD
// -------------------------------------------------------------
// Gate Verification Handler (SCRUM06B-F005-BE-001)
// -------------------------------------------------------------
document.getElementById("toggle-gate-btn")?.addEventListener("click", () => {
    const section = document.getElementById("gate-section");
    if (section) {
        section.style.display = section.style.display === "none" ? "block" : "none";
        if (section.style.display === "block") {
            section.scrollIntoView({ behavior: "smooth" });
        }
    }
});

document.getElementById("verify-gate-btn")?.addEventListener("click", async () => {
    const tokenInput = document.getElementById("gate-qr-input");
    const resultBox = document.getElementById("gate-result");
    const qrToken = tokenInput.value.trim();

    if (!qrToken) {
        resultBox.style.display = "block";
        resultBox.className = "gate-result error";
        resultBox.textContent = "Please enter a valid QR token to verify.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/gate/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_token: qrToken })
        });

        const data = await response.json();
        resultBox.style.display = "block";

        if (data.valid) {
            resultBox.className = "gate-result success";
            resultBox.innerHTML = `
                <div style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">
                    ✅ ${data.message}
                </div>
                <div><strong>Student ID:</strong> ${data.outpass.student_id}</div>
                <div><strong>Destination:</strong> ${data.outpass.destination} (${data.outpass.reason})</div>
                <div><strong>Return By:</strong> ${formatDateTime(data.outpass.return_datetime)}</div>
                <div><strong>Emergency Contact:</strong> ${data.outpass.emergency_contact || data.outpass.parent_contact || "N/A"}</div>
                <div style="margin-top: 6px; font-size: 11px; opacity: 0.9;">Gate token recorded and marked as used. Duplicate scans will be blocked.</div>
            `;
        } else {
            resultBox.className = "gate-result error";
            resultBox.innerHTML = `
                <div style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">
                    ❌ Verification Denied: ${data.message}
                </div>
                ${data.outpass ? `<div>Student: ${data.outpass.student_id} | Status: ${data.outpass.status}</div>` : ""}
            `;
        }
    } catch (err) {
        resultBox.style.display = "block";
        resultBox.className = "gate-result error";
        resultBox.textContent = "Error connecting to gate verification service.";
    }
});

// -------------------------------------------------------------
// Outpass Submission Form (SCRUM06B-F001)
// -------------------------------------------------------------
document.getElementById("new-outpass-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("form-msg");
    const destination = document.getElementById("form-destination").value.trim();
    const reason = document.getElementById("form-reason").value.trim();
    const departure = document.getElementById("form-departure").value;
    const returnTime = document.getElementById("form-return").value;
    const parentContact = document.getElementById("form-parent-contact").value.trim();
    const emergencyContact = document.getElementById("form-emergency-contact").value.trim();

    if (new Date(departure) >= new Date(returnTime)) {
        msgEl.textContent = "Departure must be earlier than return time.";
        msgEl.style.color = "#dc2626";
        return;
    }

    try {
        const payload = {
            student_id: studentId,
            destination,
            reason,
            departure_datetime: new Date(departure).toISOString(),
            return_datetime: new Date(returnTime).toISOString(),
            parent_contact: parentContact,
            emergency_contact: emergencyContact || parentContact
        };

        const res = await fetch(`${API_BASE}/api/outpasses/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Submission failed");
        }

        msgEl.textContent = "Outpass submitted successfully (Status: PENDING)!";
        msgEl.style.color = "#16a34a";
        document.getElementById("new-outpass-form").reset();
        showToast("Request Submitted", `Outpass request to ${destination} submitted for warden review.`, "info");
        loadOutpasses();
    } catch (err) {
        msgEl.textContent = err.message || "Failed to submit request.";
        msgEl.style.color = "#dc2626";
    }
});

// Event Listeners
document.getElementById("status-filter")?.addEventListener("change", filterHistory);
document.getElementById("search-history")?.addEventListener("input", filterHistory);
document.getElementById("refresh-button")?.addEventListener("click", loadOutpasses);

// Initial load
loadOutpasses();
loadNotifications();

// Auto-check notifications every 15 seconds for real-time status updates
setInterval(loadNotifications, 15000);
=======

document.getElementById("status-filter").addEventListener(
    "change",
    filterHistory
);


document.getElementById("search-history").addEventListener(
    "input",
    filterHistory
);
document.getElementById("refresh-button").addEventListener(
    "click",
    loadOutpasses
);

loadOutpasses();



document.getElementById("outpass-form").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const departure = document.getElementById(
            "departure_datetime"
        ).value;

        const returnTime = document.getElementById(
            "return_datetime"
        ).value;

        const message = document.getElementById("form-message");

        if (new Date(returnTime) <= new Date(departure)) {
            message.textContent =
                "Return time must be after departure time.";
            return;
        }

        const requestData = {
            student_id: studentId,
            destination: document.getElementById("destination").value,
            reason: document.getElementById("reason").value,
            departure_datetime: departure,
            return_datetime: returnTime,
            parent_contact: document.getElementById("parent_contact").value
        };

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/outpasses",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer test-token"
                    },
                    body: JSON.stringify(requestData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                message.textContent =
                    data.detail || "Failed to submit request.";
                return;
            }

            message.textContent =
                "Outpass request submitted successfully! " +
                "Tracking Reference: " + data.id;

            document.getElementById("outpass-form").reset();

            loadOutpasses();

        } catch (error) {
            message.textContent =
                "Unable to connect to the backend.";
            console.error(error);
        }
    }
);
>>>>>>> c860b4b89ef3f0e0294ea04ddbc8d2ffafcbfb17
