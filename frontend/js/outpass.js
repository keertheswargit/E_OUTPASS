let historyData = [];
const studentId = "2024506050";


function formatDateTime(dateTime) {
    const date = new Date(dateTime);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================
   F004 - Load Notifications
   ========================= */

async function loadNotifications() {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/notifications/${studentId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load notifications");
        }

        const notifications = await response.json();

        displayNotifications(notifications);

    } catch (error) {
        document.getElementById("notifications-container").innerHTML =
            "<p>Unable to load notifications.</p>";

        console.error(error);
    }
}


function displayNotifications(notifications) {
    const container =
        document.getElementById("notifications-container");

    if (notifications.length === 0) {
        container.innerHTML =
            "<p>No notifications.</p>";
        return;
    }

    let content = "";

    notifications.forEach(notification => {

        content += `
            <div class="card">
                <p>
                    <strong>${notification.message}</strong>
                </p>

                <p>
                    Status:
                    <span class="status status-${notification.status}">
                        ${notification.status}
                    </span>
                </p>

                <p>
                    ${formatDateTime(notification.created_at)}
                </p>
            </div>
        `;
    });

    container.innerHTML = content;
}


/* =========================
   F003 - Load Outpasses
   ========================= */

async function loadOutpasses() {
    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/outpasses/my?student_id=${studentId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load outpasses");
        }

        const data = await response.json();

        displayCurrent(data.current);
        displayHistory(data.history);

    } catch (error) {

        document.getElementById("current-outpass").innerHTML =
            "<p>Unable to load outpass details.</p>";

        document.getElementById("history-container").innerHTML =
            "<p>Unable to load history.</p>";

        console.error(error);
    }
}


function displayCurrent(outpass) {

    const container =
        document.getElementById("current-outpass");

    if (!outpass) {
        container.innerHTML =
            "<p>No current outpass request.</p>";
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

    const container =
        document.getElementById("history-container");

    if (history.length === 0) {
        container.innerHTML =
            "<p>No previous outpass history.</p>";
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

                <td>
                    ${formatDateTime(outpass.request_timestamp)}
                </td>

                <td>
                    ${formatDateTime(outpass.departure_datetime)}
                </td>

                <td>
                    ${formatDateTime(outpass.return_datetime)}
                </td>

                <td>
                    <span class="status status-${outpass.status}">
                        ${outpass.status}
                    </span>
                </td>

                <td>
                    ${outpass.warden_remarks || "No remarks"}
                </td>

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

        return matchesStatus && matchesSearch;
    });

    displayHistory(filteredHistory);
}


/* =========================
   Event Listeners
   ========================= */

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


/* =========================
   Initial Load
   ========================= */

loadOutpasses();
loadNotifications();