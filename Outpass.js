const mongoose = require('mongoose');

const outpassSchema = new mongoose.Schema({
    studentId: { 
        type: String, 
        required: true 
    },
    destination: { 
        type: String, 
        required: [true, 'Destination is mandatory'] 
    },
    reason: { 
        type: String, 
        required: [true, 'Reason is mandatory'] 
    },
    departureTime: { 
        type: Date, 
        required: [true, 'Departure time is mandatory'] 
    },
    returnTime: { 
        type: Date, 
        required: [true, 'Return time is mandatory'],
        validate: {
            validator: function(value) {
                return this.departureTime < value;
            },
            message: 'Return time must be after the departure time.'
        }
    },
    contactDetails: { 
        type: String, 
        required: [true, 'Contact details are mandatory'] 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Outpass', outpassSchema);