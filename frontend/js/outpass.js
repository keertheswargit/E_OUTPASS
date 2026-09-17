let historyData = [];
const studentId = "2024506050";
let activeQrToken = "";

// Dynamic backend host configuration
const API_BASE_URL = "http://127.0.0.1:8000";

function formatDateTime(dateTime) {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Tab navigation handler
document.querySelectorAll(".nav-tab").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
        document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

        tabBtn.classList.add("active");
        const tabId = tabBtn.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");

        if (tabId === "warden-portal") {
            loadPendingOutpasses();
        } else if (tabId === "student-portal") {
            loadOutpasses();
            loadNotifications();
        }
    });
});

// Notifications modal toggle
document.getElementById("notif-bell").addEventListener("click", () => {
    const modal = document.getElementById("notif-modal");
    modal.classList.toggle("hidden");
});

async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/my?student_id=${studentId}`);
        if (!response.ok) return;
        const notifs = await response.json();

        const countBadge = document.getElementById("notif-count");
        countBadge.innerText = notifs.filter(n => !n.is_read).length;

        const container = document.getElementById("notif-list");
        if (notifs.length === 0) {
            container.innerHTML = "<p>No notifications yet.</p>";
            return;
        }

        container.innerHTML = notifs.map(n => `
            <div class="notif-item ${n.notification_type.includes('APPROVED') ? 'APPROVED' : 'REJECTED'}">
                <div><strong>${n.message}</strong></div>
                <div class="notif-time">${formatDateTime(n.created_at)}</div>
            </div>
        `).join("");

    } catch (err) {
        console.error("Error loading notifications:", err);
    }
}

// Load Outpasses for Student
async function loadOutpasses() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/outpasses/my?student_id=${studentId}`);

        if (!response.ok) {
            throw new Error("Failed to load outpasses");
        }

        const data = await response.json();

        displayCurrent(data.current);
        displayHistory(data.history);

    } catch (error) {
        document.getElementById("current-outpass").innerHTML =
            "<p>Unable to load outpass details. Please ensure backend is running.</p>";

        document.getElementById("history-container").innerHTML =
            "<p>Unable to load history.</p>";

        console.error(error);
    }
}

function displayCurrent(outpass) {
    const container = document.getElementById("current-outpass");
    const qrContainer = document.getElementById("qr-container");

    if (!outpass) {
        container.innerHTML = "<p>No active outpass request.</p>";
        qrContainer.classList.add("hidden");
        activeQrToken = "";
        return;
    }

    container.innerHTML = `
        <p><strong>Destination:</strong> ${outpass.destination}</p>
        <p><strong>Reason:</strong> ${outpass.reason}</p>
        <p><strong>Departure:</strong> ${formatDateTime(outpass.departure_datetime)}</p>
        <p><strong>Return:</strong> ${formatDateTime(outpass.return_datetime)}</p>
        <p><strong>Status:</strong> 
            <span class="status status-${outpass.status}">${outpass.status}</span>
        </p>
        <p><strong>Warden Remarks:</strong> ${outpass.warden_remarks || "No remarks"}</p>
    `;

    // Render QR Code if Approved
    if (outpass.status === "APPROVED" && outpass.qr_code_token) {
        activeQrToken = outpass.qr_code_token;
        qrContainer.classList.remove("hidden");
        document.getElementById("qr-token-val").innerText = outpass.qr_code_token;

        renderQRCodeSvg("qr-code-display", outpass.qr_code_token);
    } else {
        qrContainer.classList.add("hidden");
        activeQrToken = "";
    }
}

function renderQRCodeSvg(elementId, text) {
    const displayBox = document.getElementById(elementId);
    displayBox.innerHTML = "";

    try {
        if (typeof qrcode !== "undefined") {
            const qr = qrcode(0, 'M');
            qr.addData(text);
            qr.make();
            displayBox.innerHTML = qr.createSvgTag(5, 0);
        } else {
            // Fallback SVG representation if CDN library offline
            displayBox.innerHTML = `
                <svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="#ffffff" stroke="#2563eb" stroke-width="3"/>
                    <rect x="10" y="10" width="25" height="25" fill="#2563eb"/>
                    <rect x="65" y="10" width="25" height="25" fill="#2563eb"/>
                    <rect x="10" y="65" width="25" height="25" fill="#2563eb"/>
                    <rect x="40" y="40" width="20" height="20" fill="#000000"/>
                    <text x="50" y="92" font-size="7" text-anchor="middle" fill="#333">SCAN ME</text>
                </svg>
            `;
        }
    } catch (err) {
        displayBox.innerHTML = `<p style="font-size:0.8rem;color:#666;">QR Token: ${text}</p>`;
    }
}

function displayHistory(history) {
    historyData = history;
    const container = document.getElementById("history-container");

    if (!history || history.length === 0) {
        container.innerHTML = "<p>No previous outpass history.</p>";
        return;
    }

    let table = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>Destination</th>
                    <th>Reason</th>
                    <th>Request Date</th>
                    <th>Departure</th>
                    <th>Return</th>
                    <th>Status</th>
                    <th>Warden Remarks</th>
                </tr>
            </thead>
            <tbody>
    `;

    history.forEach(outpass => {
        table += `
            <tr>
                <td>${outpass.destination}</td>
                <td>${outpass.reason}</td>
                <td>${formatDateTime(outpass.request_timestamp)}</td>
                <td>${formatDateTime(outpass.departure_datetime)}</td>
                <td>${formatDateTime(outpass.return_datetime)}</td>
                <td>
                    <span class="status status-${outpass.status}">${outpass.status}</span>
                </td>
                <td>${outpass.warden_remarks || "No remarks"}</td>
            </tr>
        `;
    });

    table += `
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

function filterHistory() {
    const selectedStatus = document.getElementById("status-filter").value;
    const searchText = document.getElementById("search-history").value.toLowerCase();

    const filteredHistory = historyData.filter(outpass => {
        const matchesStatus = selectedStatus === "ALL" || outpass.status === selectedStatus;
        const matchesSearch =
            outpass.destination.toLowerCase().includes(searchText) ||
            outpass.reason.toLowerCase().includes(searchText);

        return matchesStatus && matchesSearch;
    });

    displayHistory(filteredHistory);
}

// Student Submit Outpass Handler
document.getElementById("outpass-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgBox = document.getElementById("form-msg");
    msgBox.className = "msg-box";

    const payload = {
        student_id: studentId,
        destination: document.getElementById("destination").value,
        reason: document.getElementById("reason").value,
        departure_datetime: new Date(document.getElementById("departure_datetime").value).toISOString(),
        return_datetime: new Date(document.getElementById("return_datetime").value).toISOString(),
        parent_contact: document.getElementById("parent_contact").value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/outpasses/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Submission failed");
        }

        msgBox.innerText = "Outpass request submitted successfully!";
        msgBox.classList.add("msg-success");
        document.getElementById("outpass-form").reset();

        loadOutpasses();
    } catch (err) {
        msgBox.innerText = err.message;
        msgBox.classList.add("msg-error");
    }
});

// Warden Portal Pending Outpasses
async function loadPendingOutpasses() {
    const container = document.getElementById("warden-pending-container");
    container.innerHTML = "Loading pending applications...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/warden/outpasses/pending`);
        if (!response.ok) throw new Error("Failed to load pending requests.");
        const pendingList = await response.json();

        if (pendingList.length === 0) {
            container.innerHTML = "<p>No pending outpass applications at this time.</p>";
            return;
        }

        container.innerHTML = pendingList.map(item => `
            <div class="pending-card">
                <div class="pending-card-header">
                    <span>Student ID: ${item.student_id}</span>
                    <span class="status status-PENDING">PENDING REVIEW</span>
                </div>
                <div class="pending-details">
                    <div><strong>Destination:</strong> ${item.destination}</div>
                    <div><strong>Reason:</strong> ${item.reason}</div>
                    <div><strong>Departure:</strong> ${formatDateTime(item.departure_datetime)}</div>
                    <div><strong>Return:</strong> ${formatDateTime(item.return_datetime)}</div>
                    <div><strong>Parent Contact:</strong> ${item.parent_contact}</div>
                    <div><strong>Request Time:</strong> ${formatDateTime(item.request_timestamp)}</div>
                </div>
                <input type="text" id="remarks-${item._id}" class="remarks-input" placeholder="Add warden remarks (optional)">
                <div class="warden-actions">
                    <button onclick="handleWardenDecision('${item._id}', 'approve')" class="btn btn-success">✅ Approve Request</button>
                    <button onclick="handleWardenDecision('${item._id}', 'reject')" class="btn btn-danger">❌ Reject Request</button>
                </div>
            </div>
        `).join("");

    } catch (err) {
        container.innerHTML = `<p style="color:red;">Error loading pending requests: ${err.message}</p>`;
    }
}

async function handleWardenDecision(outpassId, action) {
    const remarksInput = document.getElementById(`remarks-${outpassId}`);
    const warden_remarks = remarksInput ? remarksInput.value : "";

    try {
        const response = await fetch(`${API_BASE_URL}/api/warden/outpasses/${outpassId}/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ warden_remarks })
        });

        if (!response.ok) throw new Error(`Failed to ${action} request`);

        alert(`Outpass request successfully ${action}d!`);
        loadPendingOutpasses();
        loadOutpasses();
        loadNotifications();
    } catch (err) {
        alert(err.message);
    }
}

// Camera-based QR Scanner Implementation
let html5QrScanner = null;

async function startCameraScanner() {
    const readerDiv = document.getElementById("reader");
    const statusText = document.getElementById("camera-status");
    const startBtn = document.getElementById("start-camera-btn");
    const stopBtn = document.getElementById("stop-camera-btn");

    if (typeof Html5Qrcode === "undefined") {
        alert("Camera scanner library failed to load. Please check internet connection or enter token manually.");
        return;
    }

    readerDiv.classList.remove("hidden");
    statusText.innerText = "Initializing web camera access...";
    startBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");

    try {
        html5QrScanner = new Html5Qrcode("reader");

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        await html5QrScanner.start(
            { facingMode: "environment" },
            config,
            (decodedText, decodedResult) => {
                // QR code successfully scanned from camera feed!
                statusText.innerText = `✅ Scanned QR Token: ${decodedText}`;
                document.getElementById("qr-input").value = decodedText;

                // Trigger verification automatically
                verifyQrToken(decodedText);

                // Stop camera scan after successful detection
                stopCameraScanner();
            },
            (errorMessage) => {
                // Video frame processing... (silent)
            }
        );

        statusText.innerText = "📷 Camera active! Point camera at student's QR code card.";
    } catch (err) {
        statusText.innerText = `❌ Camera access error: ${err.message || err}`;
        startBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");
        readerDiv.classList.add("hidden");
    }
}

async function stopCameraScanner() {
    const readerDiv = document.getElementById("reader");
    const statusText = document.getElementById("camera-status");
    const startBtn = document.getElementById("start-camera-btn");
    const stopBtn = document.getElementById("stop-camera-btn");

    if (html5QrScanner) {
        try {
            await html5QrScanner.stop();
            html5QrScanner.clear();
        } catch (err) {
            console.warn("Camera stop warning:", err);
        }
        html5QrScanner = null;
    }

    readerDiv.classList.add("hidden");
    startBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
    if (!statusText.innerText.includes("Scanned QR Token")) {
        statusText.innerText = "Camera stopped. Click 'Start Camera Scanner' to scan again.";
    }
}

// Function to perform verification API call
async function verifyQrToken(qrToken) {
    const resultBox = document.getElementById("gate-result-container");

    try {
        const response = await fetch(`${API_BASE_URL}/api/gate/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qr_token: qrToken })
        });

        const data = await response.json();

        if (data.valid) {
            resultBox.className = "gate-result-container";
            resultBox.innerHTML = `
                <div class="gate-banner valid">
                    <div class="gate-banner-icon">✅</div>
                    <h4>CONFIRMED VALID</h4>
                    <p>${data.message}</p>
                    <table class="gate-details-table">
                        <tr><td><strong>Student ID:</strong></td><td>${data.outpass.student_id}</td></tr>
                        <tr><td><strong>Destination:</strong></td><td>${data.outpass.destination}</td></tr>
                        <tr><td><strong>Reason:</strong></td><td>${data.outpass.reason}</td></tr>
                        <tr><td><strong>Departure:</strong></td><td>${formatDateTime(data.outpass.departure_datetime)}</td></tr>
                        <tr><td><strong>Return:</strong></td><td>${formatDateTime(data.outpass.return_datetime)}</td></tr>
                        <tr><td><strong>Parent Contact:</strong></td><td>${data.outpass.parent_contact}</td></tr>
                    </table>
                </div>
            `;
        } else {
            resultBox.className = "gate-result-container";
            resultBox.innerHTML = `
                <div class="gate-banner invalid">
                    <div class="gate-banner-icon">❌</div>
                    <h4>INVALID / REJECTED</h4>
                    <p>${data.message}</p>
                    ${data.outpass ? `
                        <table class="gate-details-table">
                            <tr><td><strong>Student ID:</strong></td><td>${data.outpass.student_id}</td></tr>
                            <tr><td><strong>Destination:</strong></td><td>${data.outpass.destination}</td></tr>
                            <tr><td><strong>Status:</strong></td><td>${data.outpass.status}</td></tr>
                        </table>
                    ` : ""}
                </div>
            `;
        }
    } catch (err) {
        resultBox.innerHTML = `<div class="gate-banner invalid"><h4>ERROR</h4><p>${err.message}</p></div>`;
    }
}

// Gate Verification Form Handler
document.getElementById("gate-verify-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const qrToken = document.getElementById("qr-input").value.trim();
    verifyQrToken(qrToken);
});

// Quick action button to paste active student QR token
document.getElementById("use-active-qr-btn").addEventListener("click", () => {
    if (activeQrToken) {
        document.getElementById("qr-input").value = activeQrToken;
    } else {
        alert("No active approved student QR code currently available. Approve a request in the Warden tab first!");
    }
});

// Camera Buttons Listeners
document.getElementById("start-camera-btn").addEventListener("click", startCameraScanner);
document.getElementById("stop-camera-btn").addEventListener("click", stopCameraScanner);

// Event Listeners
document.getElementById("status-filter").addEventListener("change", filterHistory);
document.getElementById("search-history").addEventListener("input", filterHistory);
document.getElementById("refresh-button").addEventListener("click", loadOutpasses);
document.getElementById("warden-refresh-btn").addEventListener("click", loadPendingOutpasses);

// Initial Load
loadOutpasses();
loadNotifications();