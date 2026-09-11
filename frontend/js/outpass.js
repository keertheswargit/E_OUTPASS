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
    const container = document.getElementById("current-outpass");

    if (!outpass) {
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