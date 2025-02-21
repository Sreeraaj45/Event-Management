const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB Connection String
const dbURI = "mongodb+srv://sreeraaj:mypassword123@cluster0.y1hqf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" }, // Default role is "student"
});

// User Model
const User = mongoose.model("User", userSchema);

// MongoDB Connection
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB Connected");

    // Dummy users to be created
    const users = [
      // Admin accounts
      { username: "admin1", password: "adminpass1", role: "admin" },
      { username: "admin2", password: "adminpass2", role: "admin" },

      // Teacher accounts
      { username: "teacher1", password: "teacherpass1", role: "teacher" },
      { username: "teacher2", password: "teacherpass2", role: "teacher" },

      // Student accounts
      { username: "student1", password: "studentpass1", role: "student" },
      { username: "student2", password: "studentpass2", role: "student" },
      { username: "student3", password: "studentpass3", role: "student" },
    ];

    try {
      for (const user of users) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insert the user into the database
        const newUser = new User({
          username: user.username,
          password: hashedPassword,
          role: user.role,
        });

        await newUser.save();
        console.log(`User created: ${user.username} / ${user.password} / Role: ${user.role}`);
      }
    } catch (error) {
      console.error("Error seeding users:", error.message);
    } finally {
      mongoose.connection.close(); // Close the connection after seeding
    }
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });
