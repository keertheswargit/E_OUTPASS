# E-Outpass System 🎓

A digital hostel outpass management system designed to replace manual record-checking at university gates. This system allows students to request outpasses and provides gate staff with a quick, secure QR code verification process.

## 🚀 Features
* **Digital Outpass Requests:** Students can apply for outpasses digitally.
* **Instant QR Verification (SCRUM06B-F005-UI-001):** Once an outpass is approved, the system generates a unique QR code on the student's dashboard. Gate staff can scan this code to instantly verify the approval status, significantly speeding up physical gate checks.
* **Real-time Status Updates:** View pending, approved, or rejected statuses.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, Plain Vanilla JavaScript
* **Backend:** Python (Flask)
* **Database:** MongoDB
* **Libraries:** `qrcode.js` (Frontend QR Generation), `flask-cors` (API Communication)

## 💻 Local Setup & Installation

Follow these steps to run the project on your local machine:

**1. Prerequisites**
* Install [Python 3.x](https://www.python.org/downloads/)
* Install [MongoDB](https://www.mongodb.com/try/download/community) and ensure it is running locally on port `27017`.

**2. Clone the repository**
```bash
git clone [https://github.com/keertheswargit/E_OUTPASS.git](https://github.com/keertheswargit/E_OUTPASS.git)
cd E_OUTPASS
