// E-Outpass Management System - Express Backend Server
// Provides REST APIs for Warden Dashboard and Outpass Data Store

const express = require("express");
const path = require("path");
const { outpassStore } = require("./db/outpassStore");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ==========================================
// REST API Endpoints
// ==========================================

/**
 * GET /api/stats
 * Returns dashboard metrics (Pending, Approved Today, Rejected Today, Outside count, etc.)
 */
app.get("/api/stats", (req, res) => {
  try {
    const stats = outpassStore.getStatistics();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/outpasses/pending
 * Returns all pending outpass requests for warden review
 */
app.get("/api/outpasses/pending", (req, res) => {
  try {
    const { hostelBlock, outpassType, search } = req.query;
    const requests = outpassStore.getPending({ hostelBlock, outpassType, search });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/outpasses
 * Returns outpass requests with filtering and search
 */
app.get("/api/outpasses", (req, res) => {
  try {
    const { status, hostelBlock, outpassType, search } = req.query;
    const records = outpassStore.getAll({ status, hostelBlock, outpassType, search });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/outpasses/:id
 * Returns a specific outpass by ID
 */
app.get("/api/outpasses/:id", (req, res) => {
  try {
    const record = outpassStore.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: "Outpass request not found" });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/outpasses
 * Creates a new outpass request (Used by Student Form / Simulator)
 */
app.post("/api/outpasses", (req, res) => {
  try {
    const created = outpassStore.create(req.body);
    res.status(201).json({
      success: true,
      message: "Outpass request submitted successfully",
      data: created
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/outpasses/:id/status
 * Reviews an outpass request (APPROVE or REJECT with remarks)
 */
app.patch("/api/outpasses/:id/status", (req, res) => {
  try {
    const { status, wardenRemarks, reviewedBy } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required (APPROVED or REJECTED)" });
    }

    const updated = outpassStore.updateStatus(req.params.id, {
      status,
      wardenRemarks,
      reviewedBy: reviewedBy || "Chief Warden Dr. R. Sundaram"
    });

    res.json({
      success: true,
      message: `Outpass request ${status.toLowerCase()} successfully`,
      data: updated
    });
  } catch (err) {
    const statusCode = err.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reset-seed
 * Resets database back to default seed data for demonstration
 */
app.post("/api/reset-seed", (req, res) => {
  try {
    const result = outpassStore.resetWithSeed();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback route for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start Server with graceful port fallback
function startServer(port = PORT, retries = 5) {
  const serverInstance = app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`  E-Outpass Management System Server Running!       `);
    console.log(`  URL: http://localhost:${port}                     `);
    console.log(`  Warden Review Dashboard & Data Store Active       `);
    console.log(`====================================================`);
  });

  serverInstance.on("error", (err) => {
    if (err.code === "EADDRINUSE" && retries > 0) {
      console.warn(`[Port ${port} in use, trying port ${port + 1}...]`);
      startServer(port + 1, retries - 1);
    } else {
      console.error("Server failed to start:", err);
    }
  });

  return serverInstance;
}

if (require.main === module) {
  startServer(Number(PORT));
}

module.exports = app;

