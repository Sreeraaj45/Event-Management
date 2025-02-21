const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const path = require("path");
const rateLimit = require("express-rate-limit");

// Express App
const app = express();

const dbURI = "mongodb+srv://sreeraaj:mypassword123@cluster0.y1hqf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session Middleware
app.use(
  session({
    secret: "eventManagementSecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbURI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// Set View Engine
app.set("view engine", "ejs");

// Define Models
const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" }, // Roles: 'admin', 'teacher', 'student'
}));

const Event = mongoose.model("Event", new mongoose.Schema({
  auditorium: { type: String, required: true },
  eventName: { type: String, required: true },
  date: { type: Date, required: true },
  timeStart: { type: String, required: true },
  timeEnd: { type: String, required: true },
  organizer: { type: String, required: true },
  status: { type: String, default: "pending" },
}));

// Middleware for Authentication
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/login");
};

// Middleware for Role-Based Authorization
const isRole = (role) => (req, res, next) => {
  if (req.session.user && req.session.user.role === role) return next();
  res.status(403).send("Access Denied");
};

// Rate Limiter for Login to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// Routes

// Redirect Root to Login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Login Route
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.render("login", { error: "Invalid username or password." });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.render("login", { error: "Invalid username or password." });
  }

  // Save user in session
  req.session.user = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  res.redirect("/dashboard");
});

// Register Route
app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    res.render("register", { error: "User already exists or invalid data." });
  }
});

// Dashboard
app.get("/dashboard", isAuthenticated, async (req, res) => {
  const userRole = req.session.user.role;

  if (userRole === "admin") {
    return res.redirect("/admin-dashboard");
  }

  if (userRole === "teacher") {
    const events = await Event.find({ status: "pending" });
    return res.render("teacher-dashboard", { user: req.session.user, events });
  }

  if (userRole === "student") {
    const events = await Event.find();
    return res.render("student-dashboard", { user: req.session.user, events });
  }

  res.status(403).send("Invalid role.");
});

// Admin Dashboard
app.get("/admin-dashboard", isAuthenticated, isRole("admin"), async (req, res) => {
  const users = await User.find();
  const events = await Event.find();
  res.render("admin-dashboard", { user: req.session.user, users, events });
});

// Admin Event Schedule
app.get("/admin-event-schedule", isAuthenticated, isRole("admin"), async (req, res) => {
  const events = await Event.find();
  res.render("admin-event-schedule", { user: req.session.user, events });
});

// Admin Privilege Management
app.get("/admin-privilege-management", isAuthenticated, isRole("admin"), async (req, res) => {
  const users = await User.find();
  res.render("admin-privilege-management", { user: req.session.user, users });
});

// Admin Event CRUD
app.post("/add-event", isAuthenticated, isRole("admin"), async (req, res) => {
  const { eventName, auditorium, date, timeStart, timeEnd, organizer } = req.body;
  const newEvent = new Event({ eventName, auditorium, date: new Date(date), timeStart, timeEnd, organizer });
  await newEvent.save();
  res.redirect("/admin-event-schedule");
});

app.post("/delete-event", isAuthenticated, isRole("admin"), async (req, res) => {
  const { eventId } = req.body;
  await Event.findByIdAndDelete(eventId);
  res.redirect("/admin-event-schedule");
});

// Admin User CRUD
app.post("/add-user", isAuthenticated, isRole("admin"), async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword, role });
  await newUser.save();
  res.redirect("/admin-privilege-management");
});

app.post("/delete-user", isAuthenticated, isRole("admin"), async (req, res) => {
  const { userId } = req.body;
  await User.findByIdAndDelete(userId);
  res.redirect("/admin-privilege-management");
});

app.post("/update-privilege", isAuthenticated, isRole("admin"), async (req, res) => {
  const { userId, newRole } = req.body;
  await User.findByIdAndUpdate(userId, { role: newRole });
  res.redirect("/admin-privilege-management");
});

// Teacher Event Management
app.post("/approve-event", isAuthenticated, isRole("teacher"), async (req, res) => {
  const { eventId } = req.body;
  await Event.findByIdAndUpdate(eventId, { status: "approved" });
  res.redirect("/dashboard");
});

app.post("/reject-event", isAuthenticated, isRole("teacher"), async (req, res) => {
  const { eventId } = req.body;
  await Event.findByIdAndUpdate(eventId, { status: "rejected" });
  res.redirect("/dashboard");
});

app.post("/create-event", isAuthenticated, isRole("teacher"), async (req, res) => {
  const { auditorium, eventName, date, timeStart, timeEnd, organizer } = req.body;

  const clash = await Event.findOne({
    auditorium,
    date: new Date(date),
    $or: [
      { timeStart: { $lt: timeEnd, $gte: timeStart } },
      { timeEnd: { $gt: timeStart, $lte: timeEnd } },
    ],
  });

  if (clash) {
    return res.send("Slot already booked for this time.");
  }

  await new Event({ auditorium, eventName, date: new Date(date), timeStart, timeEnd, organizer, status: "approved" }).save();
  res.redirect("/dashboard");
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Server Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

