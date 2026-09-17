// User Repository
// Manages authentication and user profile queries against registered users in the database

const db = require("../config/db");

// Registered seed users for testing / offline fallback
const registeredUsersStore = new Map([
  [
    "WARDEN-001",
    {
      id: "WARDEN-001",
      name: "Dr. R. Sundaram",
      email: "warden.sundaram@college.edu",
      password: "warden123",
      role: "WARDEN",
      hostel_block: "Block A & C (Boys)",
      phone: "+91 94432 00001"
    }
  ],
  [
    "WARDEN-002",
    {
      id: "WARDEN-002",
      name: "Dr. S. Meenakshi",
      email: "warden.meenakshi@college.edu",
      password: "warden123",
      role: "WARDEN",
      hostel_block: "Block B & D (Girls)",
      phone: "+91 94432 00002"
    }
  ],
  // Boys Hostel - Block A
  [
    "23IT101",
    {
      id: "23IT101",
      name: "Keertheswar S",
      email: "keertheswar@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Information Technology",
      year: "3rd Year",
      hostel_block: "Block A (Boys)",
      room_number: "A-304",
      phone: "+91 98765 43210"
    }
  ],
  [
    "22EC088",
    {
      id: "22EC088",
      name: "Arvind Kumar R",
      email: "arvind.ec@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Electronics & Communication",
      year: "4th Year",
      hostel_block: "Block A (Boys)",
      room_number: "A-118",
      phone: "+91 91234 56780"
    }
  ],
  [
    "24CS045",
    {
      id: "24CS045",
      name: "Karthik Raja P",
      email: "karthik.cs@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Computer Science",
      year: "1st Year",
      hostel_block: "Block A (Boys)",
      room_number: "A-105",
      phone: "+91 98401 23456"
    }
  ],
  // Boys Hostel - Block C
  [
    "23ME034",
    {
      id: "23ME034",
      name: "Mohammed Faizal",
      email: "faizal.me@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Mechanical Engineering",
      year: "3rd Year",
      hostel_block: "Block C (Boys)",
      room_number: "C-204",
      phone: "+91 96551 23478"
    }
  ],
  [
    "23EE062",
    {
      id: "23EE062",
      name: "Sanjay V",
      email: "sanjay.ee@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Electrical & Electronics",
      year: "3rd Year",
      hostel_block: "Block C (Boys)",
      room_number: "C-312",
      phone: "+91 99440 98765"
    }
  ],
  // Girls Hostel - Block B
  [
    "23CS142",
    {
      id: "23CS142",
      name: "Priya Dharshini M",
      email: "priya.cs@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Computer Science",
      year: "3rd Year",
      hostel_block: "Block B (Girls)",
      room_number: "B-214",
      phone: "+91 97890 12345"
    }
  ],
  [
    "23AI015",
    {
      id: "23AI015",
      name: "Sneha Nair",
      email: "sneha.ai@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "AI & Data Science",
      year: "2nd Year",
      hostel_block: "Block B (Girls)",
      room_number: "B-108",
      phone: "+91 98945 61234"
    }
  ],
  [
    "22IT115",
    {
      id: "22IT115",
      name: "Deepa Lakshmi V",
      email: "deepa.it@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Information Technology",
      year: "4th Year",
      hostel_block: "Block B (Girls)",
      room_number: "B-305",
      phone: "+91 98421 98765"
    }
  ],
  // Girls Hostel - Block D
  [
    "23BT028",
    {
      id: "23BT028",
      name: "Ananya Ramesh",
      email: "ananya.bt@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Biotechnology",
      year: "3rd Year",
      hostel_block: "Block D (Girls)",
      room_number: "D-201",
      phone: "+91 97900 11223"
    }
  ],
  [
    "24EC071",
    {
      id: "24EC071",
      name: "Kavitha S",
      email: "kavitha.ec@student.college.edu",
      password: "student123",
      role: "STUDENT",
      department: "Electronics & Communication",
      year: "2nd Year",
      hostel_block: "Block D (Girls)",
      room_number: "D-115",
      phone: "+91 94455 66778"
    }
  ]
]);

class UserRepository {
  /**
   * Find a user by their user ID or email
   * @param {string} identifier 
   * @returns {Promise<Object|null>}
   */
  async findByIdentifier(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toUpperCase();

    try {
      if (db.isPostgresConnected()) {
        const sql = `
          SELECT id, name, email, password, role, hostel_block, phone
          FROM users
          WHERE UPPER(id) = $1 OR UPPER(email) = $1;
        `;
        const result = await db.query(sql, [cleanId]);
        return result.rows[0] || null;
      }
    } catch (err) {
      console.warn("[UserRepo] Postgres query failed, falling back to local registered store:", err.message);
    }

    // Fallback store check
    for (const [key, user] of registeredUsersStore.entries()) {
      if (key.toUpperCase() === cleanId || user.email.toUpperCase() === cleanId) {
        return { ...user };
      }
    }
    return null;
  }

  /**
   * Verify user credentials against database
   * @param {string} identifier - User ID (Roll No / Warden ID) or Email
   * @param {string} password - User password
   * @returns {Promise<Object|null>} User profile without password if matched, else null
   */
  async verifyCredentials(identifier, password) {
    if (!identifier || !password) return null;

    const user = await this.findByIdentifier(identifier);
    if (!user) return null; // Not registered in DB

    // Check password
    if (user.password !== password) {
      return null; // Invalid credentials
    }

    // Return safe user object (omit password)
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Find user by ID
   * @param {string} id 
   */
  async findById(id) {
    const user = await this.findByIdentifier(id);
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = new UserRepository();
