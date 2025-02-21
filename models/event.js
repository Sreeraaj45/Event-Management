const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  auditorium: { type: String, required: true },
  eventName: { type: String, required: true },
  date: { type: Date, required: true },
  organizer: { type: String, required: true },
});

module.exports = mongoose.model("Event", eventSchema);
