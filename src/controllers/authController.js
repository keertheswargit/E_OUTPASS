// Authentication Controller
// Handles role-specific login validation, ensuring only registered users in DB can log in

const userRepository = require("../repositories/userRepository");

class AuthController {
  /**
   * POST /api/auth/login
   * Validates user credentials against database and enforces portal role
   */
  async login(req, res) {
    try {
      const { identifier, password, role } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          error: "Please provide both User ID (Roll No / Warden ID) and password."
        });
      }

      const expectedRole = (role || "").toUpperCase();
      if (expectedRole && !["STUDENT", "WARDEN"].includes(expectedRole)) {
        return res.status(400).json({
          success: false,
          error: "Invalid portal role specified. Must be 'STUDENT' or 'WARDEN'."
        });
      }

      // Check credentials strictly against database
      const verifiedUser = await userRepository.verifyCredentials(identifier, password);

      if (!verifiedUser) {
        return res.status(401).json({
          success: false,
          error: "Authentication failed. User is not registered in the hostel database or password is incorrect."
        });
      }

      // Check role matches requested portal
      if (expectedRole && verifiedUser.role !== expectedRole) {
        return res.status(403).json({
          success: false,
          error: `Portal mismatch: Account '${verifiedUser.id}' is registered as a ${verifiedUser.role}, not a ${expectedRole}. Please switch to the ${verifiedUser.role.toLowerCase()} login tab.`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Welcome back, ${verifiedUser.name}! Logged in as ${verifiedUser.role}.`,
        user: verifiedUser
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Server error during authentication: " + err.message
      });
    }
  }

  /**
   * GET /api/auth/me
   * Fetches currently active user details
   */
  async getMe(req, res) {
    try {
      const userId = req.headers["x-user-id"];
      if (!userId) {
        return res.status(401).json({ success: false, error: "Not logged in" });
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found in database" });
      }

      return res.status(200).json({ success: true, user });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });
  }
}

module.exports = new AuthController();
