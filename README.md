# Event Management System

## Description
This is a web-based Event Management System built using Node.js, Express, and MongoDB. It provides role-based access for administrators, teachers, and students to manage event bookings efficiently.

## Features
- **User Authentication:** Login and registration with session management.
- **Role-Based Access:** Users are categorized as admin, teacher, or student.
- **Event Management:** Admins and teachers can create, approve, and reject events.
- **Dashboard:** Different dashboards for admins, teachers, and students.
- **Session Handling:** Secure user session management.
- **Rate Limiting:** Prevents brute-force login attempts.
- **MongoDB Integration:** Data persistence for users and events.

## Technologies Used
- Node.js
- Express.js
- MongoDB (Mongoose)
- EJS (Embedded JavaScript Templates)
- bcrypt.js (Password Hashing)
- express-session & connect-mongo (Session Management)
- express-rate-limit (Security)

## Installation
### Prerequisites
Ensure you have Node.js and MongoDB installed on your system.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Sreeraaj45/Event-Management.git
   cd event-management
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure MongoDB:
   - Update `dbURI` in `server.js` with your MongoDB connection string.
4. Run the server:
   ```bash
   npm start
   ```
5. Open the browser and visit:
   ```
   http://localhost:3000
   ```

## Usage
- **Admin:** Can manage users, events, and privileges.
- **Teacher:** Can approve/reject event bookings.
- **Student:** Can view events and submit event requests.

## Folder Structure
```
project-root/
│-- public/             # Static files (CSS, JS, images)
│-- views/              # EJS templates
│-- server.js           # Main server file
│-- package.json        # Project metadata and dependencies
```

## Security Measures
- **Hashed Passwords**: Uses bcrypt.js for secure password storage.
- **Session Management**: Uses secure cookies for authentication.
- **Rate Limiting**: Protects against brute-force login attempts.

## Future Enhancements
- Implement notifications for event approvals/rejections.
- Add a calendar view for better event visualization.
- Improve UI using React or Vue.

## License
This project is licensed under the MIT License.

## GitHub Repository
[Event Management System](https://github.com/Sreeraaj45/Event-Management)
