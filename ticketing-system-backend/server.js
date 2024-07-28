// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const moment = require('moment');
const Ticket = require('./models/Ticket');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const mongoURI = 'mongodb://127.0.0.1:27017/ticketing-system';

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(cors());

const setSlaDuration = (priority) => {
  switch (priority) {
    case 'High':
      return 4; // 4 hours
    case 'Medium':
      return 8; // 8 hours
    case 'Low':
      return 24; // 24 hours
    default:
      return 24; // Default SLA duration
  }
};

const checkOverdue = (ticket) => {
  const currentTime = moment();
  const createdTime = moment(ticket.createdAt);
  const slaEndTime = createdTime.add(ticket.slaDuration, 'hours');
  return currentTime.isAfter(slaEndTime);
};

app.get('/api/tickets', async (req, res) => {
  const tickets = await Ticket.find();
  tickets.forEach(ticket => {
    ticket.overdue = checkOverdue(ticket);
  });
  res.json(tickets);
});

app.post('/api/tickets', async (req, res) => {
  const { priority } = req.body;
  const slaDuration = setSlaDuration(priority);
  const ticket = new Ticket({ ...req.body, slaDuration });
  await ticket.save();
  res.json(ticket);
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    ticket.overdue = checkOverdue(ticket);
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add a new endpoint to handle comments
app.post('/api/tickets/:id/comments', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    ticket.comments.push(req.body);
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
