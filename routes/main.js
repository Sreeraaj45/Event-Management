const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Event = require("../models/event");

// Middleware for authentication
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/login");
};

// Home Page
router.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await user.comparePassword(password))) {
    return res.render("login", { error: "Invalid username or password" });
  }

  req.session.user = user;
  res.redirect("/");
});

// Register Page
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    res.render("register", { error: "User already exists" });
  }
});

// Dashboard
router.get("/dashboard", isAuthenticated, async (req, res) => {
  const events = await Event.find();
  res.render("dashboard", { user: req.session.user, events });
});

// Create Event
router.post("/create-event", isAuthenticated, async (req, res) => {
  const { auditorium, eventName, date, organizer } = req.body;
  await new Event({ auditorium, eventName, date, organizer }).save();
  res.redirect("/dashboard");
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;

router.get("/login", (req, res) => {
    res.render("login", { error: null }); // Pass null for error by default
  });
  
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render("login", { error: "Invalid username or password" });
    }
  
    req.session.user = user;
    res.redirect("/dashboard");
  });
  
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
