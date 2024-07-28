// models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  name: String,
  email: String,
  title: String,
  description: String,
  priority: String,
  requestType: String,
  taskNumber: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'open' },
  assignedTo: String,
  slaDuration: Number, 
  overdue: { type: Boolean, default: false }, 
  comments: [
    {
      text: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
