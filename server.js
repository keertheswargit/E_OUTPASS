const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Outpass = require('./Outpass'); // Importing the database schema you just made!

const app = express();

// This allows our server to understand JSON data coming from the frontend
app.use(express.json()); 
app.use(cors());
// Connect to MongoDB (This sets up a local database named 'outpassDB')
mongoose.connect('mongodb://127.0.0.1:27017/outpassDB')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// --- THE OUTPASS SUBMISSION ROUTE ---
app.post('/api/outpass/request', async (req, res) => {
    try {
        // 1. System takes the data from the student's request
        const newOutpass = new Outpass(req.body);

        // 2. System validates and saves to the database
        // (If any required fields are missing, or if departure > return, Mongoose throws an error here)
        const savedOutpass = await newOutpass.save();

        // 3. System responds with success and the 'Pending' record
        res.status(201).json({
            message: 'Outpass request submitted successfully!',
            requestDetails: savedOutpass
        });

    } catch (error) {
        // If validation fails, send a 400 Bad Request back to the frontend
        res.status(400).json({
            message: 'Submission failed. Please check the required fields.',
            error: error.message
        });
    }
});

// Start the backend server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});