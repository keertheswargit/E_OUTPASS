import React, { useState } from 'react';
import './OutpassForm.css'; // Assuming you will add your CSS here

const OutpassForm = () => {
  // 1. State to hold the form data
  const [formData, setFormData] = useState({
    destination: '',
    reason: '',
    departureTime: '',
    returnTime: '',
    contactDetails: '',
    studentId: 'STU12345' // Hardcoded for now based on Jira assumption
  });

  const [message, setMessage] = useState('');

  // 2. Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle form submission (Connecting Frontend to Backend)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing

    try {
      const response = await fetch('http://localhost:3000/api/outpass/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Success: ' + result.message);
        // Clear the form on success
        setFormData({ destination: '', reason: '', departureTime: '', returnTime: '', contactDetails: '', studentId: 'STU12345' });
      } else {
        setMessage('Error: ' + result.message);
      }
    } catch (error) {
      setMessage('Failed to connect to the server.');
    }
  };

  // 4. The UI (HTML inside React)
  return (
    <div className="outpass-container">
      <h2>Request Online Outpass</h2>
      <form onSubmit={handleSubmit} className="outpass-form">
        
        <label>Destination:</label>
        <input type="text" name="destination" value={formData.destination} onChange={handleChange} required />

        <label>Reason:</label>
        <input type="text" name="reason" value={formData.reason} onChange={handleChange} required />

        <label>Departure Time:</label>
        <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} required />

        <label>Return Time:</label>
        <input type="datetime-local" name="returnTime" value={formData.returnTime} onChange={handleChange} required />

        <label>Contact Details (Phone):</label>
        <input type="text" name="contactDetails" value={formData.contactDetails} onChange={handleChange} required />

        <button type="submit">Submit Request</button>
      </form>

      {/* Display success or error messages to the user */}
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default OutpassForm;