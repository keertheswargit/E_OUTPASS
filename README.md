# 🚪 Online Outpass Request System (MERN Stack)

A full-stack web application built to digitize and streamline the college hostel leave request process, replacing traditional paper forms and reducing student waiting times.

---

## 🚀 Features

* **Digital Outpass Request Form:** Students can seamlessly submit leave requests specifying destination, reason, departure time, return time, and contact details.
* **Input Validation & Security:** Integrated frontend validation and backend security middleware (CORS, Express JSON parser).
* **Trackable Requests:** Automatically generates records with an initial status of `"Pending"` and tracks timestamps via MongoDB.
* **Database Persistence:** Stores all outpass records securely using MongoDB and Mongoose.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (running on `localhost:3001`)
* **Backend:** Node.js, Express.js (running on `localhost:3000`)
* **Database:** MongoDB & Mongoose, managed via MongoDB Compass

---

## ⚙️ Prerequisites

Make sure you have the following installed on your local machine:
* [Node.js & npm](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/try/download/community) & [MongoDB Compass](https://www.mongodb.com/products/compass)

---

## 📥 Installation & Setup

Clone the repository and set up both the backend and frontend environments:

### 1. Clone the repository
```bash
git clone [https://github.com/keertheswargit/E_OUTPASS.git](https://github.com/keertheswargit/E_OUTPASS.git)
cd OutpassProject
