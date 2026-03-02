const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Node server is running on Vercel!');
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend' });
});

// IMPORTANT: Export the app for Vercel's serverless runtime
module.exports = app;
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const crypto = require("crypto");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const { v2: cloudinary } = require("cloudinary");
// const dotenv = require("dotenv");
// const fs = require("fs");
// const nodemailer = require("nodemailer");

// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   requireTLS: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const app = express();
// const PORT = process.env.PORT || 5000;
// const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// console.log("updating to prod database");

// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const corsOptions = {
//   origin: true, // reflect request origin
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// app.use(cors(corsOptions));

// app.options("*", cors(corsOptions));

// app.set("trust proxy", 1);

// app.get("/", (req, res) => {
//   res.json({ status: "ok", message: "Nursing School API is running" });
// });

// /* =========================
//    MongoDB Connection
// ========================= */

// const uri = process.env.MONGODB_URI;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// let db;
// let usersCollection;

// async function startServer() {
//   try {
//     console.log("⏳ Connecting to MongoDB...");

//     await client.connect();

//     db = client.db("nursing-school-prod");
//     usersCollection = db.collection("users");

//     await seedHousingCollection();

//     console.log("✅ MongoDB connected");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err);
//     process.exit(1);
//   }
// }

// /* =========================
//    Database Seeding Utility
// ========================= */

// async function seedHousingCollection() {
//   try {
//     const housingCollection = db.collection("housing");

//     // Check if data already exists to avoid duplicates
//     const count = await housingCollection.countDocuments();
//     if (count > 0) {
//       console.log("ℹ️ Housing collection already populated. Skipping seed.");
//       return;
//     }

//     const rooms = [];

//     // Generate Adlam House Rooms (119)
//     for (let i = 1; i <= 119; i++) {
//       rooms.push({
//         house: "Adlam House",
//         roomNumber: `A${i.toString().padStart(2, "0")}`, // e.g., A01, A119
//         residents: [],
//         fault_reports: [],
//         status: "available",
//       });
//     }

//     // Generate Nurse Home Rooms (122)
//     for (let i = 1; i <= 122; i++) {
//       rooms.push({
//         house: "Nurse Home",
//         roomNumber: `N${i.toString().padStart(2, "0")}`, // e.g., N01, N122
//         residents: [],
//         fault_reports: [],
//         status: "available",
//       });
//     }

//     const result = await housingCollection.insertMany(rooms);
//     console.log(
//       `✅ Successfully seeded housing collection with ${result.insertedCount} rooms.`,
//     );
//   } catch (error) {
//     console.error("❌ Error seeding housing collection:", error);
//   }
// }

// /* =========================
//    Utilities
// ========================= */

// const generateToken = (userId) => {
//   return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "1h" });
// };

// const encryptPassword = async (password) => {
//   const saltRounds = 10;
//   return bcrypt.hash(password, saltRounds);
// };

// const generateId = () => {
//   return crypto.randomBytes(12).toString("hex");
// };

// /* =========================
//    Cloudinary
// ========================= */

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// /* =========================
//    Auth Routes
// ========================= */
// app.post("/register", async (req, res) => {
//   try {
//     const { username, email, password, confirmPassword, ...rest } = req.body;

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     const existingUser = await usersCollection.findOne({
//       $or: [{ username }, { email }],
//     });

//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await encryptPassword(password);

//     const result = await usersCollection.insertOne({
//       username,
//       email,
//       hashedPassword,
//       ...rest,
//       signupTimestamp: new Date(),
//       isLoggedOn: false,
//     });

//     // ✅ Create welcome notification
//     await createNotification(
//       result.insertedId.toString(),
//       username,
//       "account_created",
//       "Your account has been successfully created",
//     );

//     // ✅ Send welcome email
//     await sendWelcomeEmail(email, username);

//     const token = generateToken(result.insertedId.toString());
//     res.json({ token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Registration failed" });
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const user = await usersCollection.findOne({ username });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const valid = bcrypt.compareSync(password, user.hashedPassword);
//     if (!valid) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     await usersCollection.updateOne(
//       { _id: user._id },
//       { $set: { isLoggedOn: true, loginTimestamp: new Date() } },
//     );

//     console.log(user);

//     // ✅ Return token, username, and userType
//     res.json({
//       token,
//       username: user.username,
//       userType: user.userType,
//       userId: user.staffId || user.studentId || null,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Login failed" });
//   }
// });

// /* =========================
//    Notices Routes
// ========================= */

// app.post("/add-notice", async (req, res) => {
//   try {
//     const { title, content, priority, date, postedBy } = req.body;

//     if (!title || !content || !date || !postedBy) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const noticesCollection = db.collection("notices");

//     const result = await noticesCollection.insertOne({
//       title,
//       content,
//       priority: priority || "medium",
//       date,
//       postedBy,
//       createdAt: new Date(),
//     });

//     res.json({ success: true, noticeId: result.insertedId });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to add notice" });
//   }
// });

// app.get("/get-notices", async (req, res) => {
//   try {
//     const noticesCollection = db.collection("notices");
//     const notices = await noticesCollection
//       .find({})
//       .sort({ date: -1 })
//       .toArray();

//     res.json(notices);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch notices" });
//   }
// });

// app.delete("/delete-notice/:noticeId", async (req, res) => {
//   try {
//     const { noticeId } = req.params;
//     const noticesCollection = db.collection("notices");

//     const result = await noticesCollection.deleteOne({
//       _id: new ObjectId(noticeId),
//     });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "Notice not found" });
//     }

//     res.json({ success: true, message: "Notice deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to delete notice" });
//   }
// });

// app.put("/update-notice/:noticeId", async (req, res) => {
//   try {
//     const { noticeId } = req.params;
//     const { title, content, priority, date } = req.body;

//     if (!title || !content || !date) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const noticesCollection = db.collection("notices");

//     const result = await noticesCollection.updateOne(
//       { _id: new ObjectId(noticeId) },
//       {
//         $set: {
//           title,
//           content,
//           priority: priority || "medium",
//           date,
//           updatedAt: new Date(),
//         },
//       },
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Notice not found" });
//     }

//     res.json({
//       success: true,
//       message: "Notice updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update notice" });
//   }
// });

// /* =========================
//    Events Routes
// ========================= */

// app.post("/add-event", async (req, res) => {
//   try {
//     const { title, datetime, location, postedBy } = req.body;

//     if (!title || !datetime || !location || !postedBy) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const eventsCollection = db.collection("events");

//     // Extract date and time from datetime
//     const eventDate = new Date(datetime);
//     const date = eventDate.toISOString().split("T")[0];
//     const time = eventDate.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//     const result = await eventsCollection.insertOne({
//       title,
//       date,
//       time,
//       location,
//       postedBy,
//       createdAt: new Date(),
//     });

//     res.json({ success: true, eventId: result.insertedId });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to add event" });
//   }
// });

// app.get("/get-events", async (req, res) => {
//   try {
//     const eventsCollection = db.collection("events");
//     const events = await eventsCollection.find({}).sort({ date: 1 }).toArray();

//     res.json(events);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch events" });
//   }
// });

// app.delete("/delete-event/:eventId", async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const eventsCollection = db.collection("events");

//     const result = await eventsCollection.deleteOne({
//       _id: new ObjectId(eventId),
//     });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     res.json({ success: true, message: "Event deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to delete event" });
//   }
// });

// app.put("/update-event/:eventId", async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const { title, datetime, location } = req.body;

//     if (!title || !datetime || !location) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const eventsCollection = db.collection("events");

//     // Extract date and time from datetime
//     const eventDate = new Date(datetime);
//     const date = eventDate.toISOString().split("T")[0];
//     const time = eventDate.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//     const result = await eventsCollection.updateOne(
//       { _id: new ObjectId(eventId) },
//       {
//         $set: {
//           title,
//           date,
//           time,
//           location,
//           updatedAt: new Date(),
//         },
//       },
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     res.json({
//       success: true,
//       message: "Event updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update event" });
//   }
// });

// /* =========================
//    User Management
// ========================= */

// app.get("/get-user/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ error: "ID required" });
//     }

//     const user = await usersCollection.findOne({
//       $or: [{ studentId: id }, { staffId: id }],
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const { hashedPassword, ...userWithoutPassword } = user;

//     res.json(userWithoutPassword);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// });

// // Optional: Update user profile
// app.put("/update-user/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { email, phone, address, photo, username } = req.body;

//     if (!id) {
//       return res.status(400).json({ error: "ID required" });
//     }

//     const updateData = {};
//     if (email) updateData.email = email;
//     if (phone) updateData.phone = phone;
//     if (username) updateData.username = username;
//     if (address) updateData.address = address;
//     if (photo) updateData.photo = photo;

//     updateData.lastUpdated = new Date();

//     const result = await usersCollection.updateOne(
//       { $or: [{ studentId: id }, { staffId: id }] },
//       { $set: updateData },
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({ success: true, message: "Profile updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to update user" });
//   }
// });

// app.post("/delete-user", async (req, res) => {
//   try {
//     const { filter, update } = req.body;
//     if (!filter?._id) {
//       return res.status(400).json({ error: "Missing _id" });
//     }

//     const result = await usersCollection.updateOne(
//       { _id: new ObjectId(filter._id) },
//       { $set: update },
//     );

//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send(error);
//   }
// });

// /* =========================
//    File Upload
// ========================= */

// const upload = multer({ dest: "uploads/" });

// app.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "chat_avatars",
//     });

//     fs.unlinkSync(req.file.path);
//     res.json({ success: true, url: result.secure_url });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false });
//   }
// });

// /* =========================
//    Students with Housing Info
// ========================= */

// app.get("/get-students-with-housing", async (req, res) => {
//   try {
//     const housingCollection = db.collection("housing");

//     // Get only users where userType is 'student'
//     const students = await usersCollection
//       .find({ userType: "student" })
//       .toArray();

//     // Get all housing data
//     const housingData = await housingCollection.find({}).toArray();

//     // Create a map of userId to housing info
//     const housingMap = {};
//     housingData.forEach((room) => {
//       room.residents.forEach((residentId) => {
//         housingMap[residentId] = {
//           house: room.house,
//           roomNumber: room.roomNumber,
//           status: room.status,
//         };
//       });
//     });

//     // Combine student data with housing info
//     const studentsWithHousing = students.map((student) => {
//       const housing = housingMap[student._id.toString()] || {};
//       const { hashedPassword, ...studentWithoutPassword } = student;

//       return {
//         ...studentWithoutPassword,
//         dormHouse: housing.house || "",
//         dormNumber: housing.roomNumber || "",
//         roomStatus: housing.status || "unassigned",
//       };
//     });

//     res.json(studentsWithHousing);

//     // console.log(studentsWithHousing);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch students with housing" });
//   }
// });

// /* =========================
//    Housing Management Routes
// ========================= */

// app.post("/assign-student-housing", async (req, res) => {
//   try {
//     const { studentId, house, roomNumber } = req.body;

//     if (!studentId || !house || !roomNumber) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const housingCollection = db.collection("housing");
//     const housingRecordsCollection = db.collection("student_housing_records");

//     // Find the student to get their _id
//     const student = await usersCollection.findOne({ studentId });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Find the room
//     const room = await housingCollection.findOne({ house, roomNumber });

//     if (!room) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     // Check if room is full (2 or more residents)
//     if (room.residents && room.residents.length >= 2) {
//       return res.status(400).json({
//         message: "Room is full",
//         currentResidents: room.residents.length,
//       });
//     }

//     // Add student's _id to room (not studentId)
//     await housingCollection.updateOne(
//       { house, roomNumber },
//       {
//         $push: { residents: student._id.toString() },
//         $set: {
//           status: room.residents.length === 1 ? "occupied" : "available",
//         },
//       },
//     );

//     // Create housing record
//     await housingRecordsCollection.insertOne({
//       studentId,
//       action: "assigned",
//       description: `Student ${studentId} has been assigned to ${house} - Room ${roomNumber}`,
//       house,
//       roomNumber,
//       timestamp: new Date(),
//       performedBy: req.body.performedBy || "admin",
//     });

//     if (student.email) {
//       await sendHousingEmail(student.email, student.username, "assigned", {
//         House: house,
//         "Room Number": roomNumber,
//         "Date Assigned": new Date().toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         Status: "Active",
//       });
//     }

//     res.json({ success: true, message: "Student assigned successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to assign student" });
//   }
// });

// app.post("/move-student-housing", async (req, res) => {
//   try {
//     const { studentId, currentHouse, currentRoom, newHouse, newRoom } =
//       req.body;

//     if (!studentId || !newHouse || !newRoom) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const housingCollection = db.collection("housing");
//     const housingRecordsCollection = db.collection("student_housing_records");

//     // Find the student to get their _id
//     const student = await usersCollection.findOne({ studentId });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Find the new room
//     const newRoomData = await housingCollection.findOne({
//       house: newHouse,
//       roomNumber: newRoom,
//     });

//     if (!newRoomData) {
//       return res.status(404).json({ message: "New room not found" });
//     }

//     // Check if new room is full
//     if (newRoomData.residents && newRoomData.residents.length >= 2) {
//       return res.status(400).json({
//         message: "New room is full",
//         currentResidents: newRoomData.residents.length,
//       });
//     }

//     // Remove student from old room if they have one
//     if (currentHouse && currentRoom) {
//       const oldRoom = await housingCollection.findOne({
//         house: currentHouse,
//         roomNumber: currentRoom,
//       });
//       await housingCollection.updateOne(
//         { house: currentHouse, roomNumber: currentRoom },
//         {
//           $pull: { residents: student._id.toString() },
//           $set: {
//             status: oldRoom.residents.length <= 2 ? "available" : "occupied",
//           },
//         },
//       );
//     }

//     // Add student to new room
//     await housingCollection.updateOne(
//       { house: newHouse, roomNumber: newRoom },
//       {
//         $push: { residents: student._id.toString() },
//         $set: {
//           status: newRoomData.residents.length === 1 ? "occupied" : "available",
//         },
//       },
//     );

//     // Create housing record
//     const description =
//       currentHouse && currentRoom
//         ? `Student ${studentId} has been moved from ${currentHouse} - Room ${currentRoom} to ${newHouse} - Room ${newRoom}`
//         : `Student ${studentId} has been assigned to ${newHouse} - Room ${newRoom}`;

//     await housingRecordsCollection.insertOne({
//       studentId,
//       action: "moved",
//       description,
//       oldHouse: currentHouse || null,
//       oldRoom: currentRoom || null,
//       newHouse,
//       newRoom,
//       timestamp: new Date(),
//       performedBy: req.body.performedBy || "admin",
//     });

//     if (student.email) {
//       await sendHousingEmail(student.email, student.username, "moved", {
//         "Previous House": currentHouse || "N/A",
//         "Previous Room": currentRoom || "N/A",
//         "New House": newHouse,
//         "New Room": newRoom,
//         "Date Moved": new Date().toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//       });
//     }

//     res.json({ success: true, message: "Student moved successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to move student" });
//   }
// });

// app.post("/deactivate-student-housing", async (req, res) => {
//   try {
//     const { studentId, house, roomNumber } = req.body;

//     if (!studentId || !house || !roomNumber) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const housingCollection = db.collection("housing");
//     const housingRecordsCollection = db.collection("student_housing_records");

//     // Find the student to get their _id
//     const student = await usersCollection.findOne({ studentId });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Find the room
//     const room = await housingCollection.findOne({ house, roomNumber });

//     if (!room) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     // Remove student from room
//     await housingCollection.updateOne(
//       { house, roomNumber },
//       {
//         $pull: { residents: student._id.toString() },
//         $set: { status: room.residents.length <= 2 ? "available" : "occupied" },
//       },
//     );

//     // Create housing record
//     await housingRecordsCollection.insertOne({
//       studentId,
//       action: "deactivated",
//       description: `Student ${studentId} has been removed from ${house} - Room ${roomNumber}`,
//       house,
//       roomNumber,
//       timestamp: new Date(),
//       performedBy: req.body.performedBy || "admin",
//     });

//     if (student.email) {
//       await sendHousingEmail(student.email, student.username, "deactivated", {
//         House: house,
//         "Room Number": roomNumber,
//         "Date Deactivated": new Date().toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         Status: "Deactivated",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Student housing deactivated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to deactivate student housing" });
//   }
// });

// /* =========================
//    Room Occupancy Overview
// ========================= */

// app.get("/get-room-occupancy", async (req, res) => {
//   try {
//     const housingCollection = db.collection("housing");

//     // Get all rooms with their residents
//     const rooms = await housingCollection.find({}).toArray();

//     // Get all students to map their info
//     const students = await usersCollection
//       .find({ userType: "student" })
//       .toArray();

//     // Create a map of student _id to student info
//     const studentMap = {};
//     students.forEach((student) => {
//       studentMap[student._id.toString()] = {
//         studentId: student.studentId,
//         username: student.username,
//         gender: student.gender,
//         photo: student.photo || student.avatar,
//       };
//     });

//     // Enhance rooms with resident details
//     const roomsWithDetails = rooms.map((room) => ({
//       house: room.house,
//       roomNumber: room.roomNumber,
//       status: room.status,
//       capacity: 2,
//       occupancy: room.residents.length,
//       residents: room.residents.map(
//         (residentId) =>
//           studentMap[residentId] || {
//             studentId: "Unknown",
//             username: "Unknown",
//           },
//       ),
//     }));

//     // Group by house
//     const adlamRooms = roomsWithDetails.filter(
//       (r) => r.house === "Adlam House",
//     );
//     const nurseRooms = roomsWithDetails.filter((r) => r.house === "Nurse Home");

//     res.json({
//       adlamHouse: {
//         totalRooms: 119,
//         rooms: adlamRooms,
//         occupied: adlamRooms.filter((r) => r.occupancy > 0).length,
//         available: adlamRooms.filter((r) => r.occupancy === 0).length,
//         full: adlamRooms.filter((r) => r.occupancy >= 2).length,
//       },
//       nurseHome: {
//         totalRooms: 122,
//         rooms: nurseRooms,
//         occupied: nurseRooms.filter((r) => r.occupancy > 0).length,
//         available: nurseRooms.filter((r) => r.occupancy === 0).length,
//         full: nurseRooms.filter((r) => r.occupancy >= 2).length,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch room occupancy" });
//   }
// });

// /* =========================
//    Fault Reports Routes
// ========================= */

// app.post("/add-fault-report", upload.single("image"), async (req, res) => {
//   try {
//     const { house, roomNumber, item, details, discoveryDate, reportedBy } =
//       req.body;

//     if (!house || !roomNumber || !item || !discoveryDate || !reportedBy) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const faultReportsCollection = db.collection("fault_reports");

//     // Generate fault report ID (e.g., FR-2026-001)
//     const year = new Date().getFullYear();
//     const count = await faultReportsCollection.countDocuments();
//     const faultReportId = `FR-${year}-${String(count + 1).padStart(3, "0")}`;

//     // Upload image to Cloudinary if provided
//     let imageUrl = null;
//     if (req.file) {
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "fault_reports",
//       });
//       fs.unlinkSync(req.file.path);
//       imageUrl = result.secure_url;
//     }

//     const result = await faultReportsCollection.insertOne({
//       faultReportId,
//       house,
//       roomNumber,
//       item,
//       details: details || "",
//       discoveryDate,
//       reportedBy,
//       imageUrl,
//       status: "Pending",
//       createdAt: new Date(),
//     });

//     // ✅ Send notification email
//     await sendReportNotificationEmail(
//       "fault",
//       {
//         faultReportId,
//         house,
//         roomNumber,
//         item,
//         details,
//         discoveryDate,
//         reportedBy,
//       },
//       imageUrl,
//     );

//     res.json({ success: true, faultReportId: result.insertedId });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to add fault report" });
//   }
// });

// app.get("/get-fault-reports", async (req, res) => {
//   try {
//     const faultReportsCollection = db.collection("fault_reports");
//     const reports = await faultReportsCollection
//       .find({})
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.json(reports);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch fault reports" });
//   }
// });

// app.put("/update-fault-status", async (req, res) => {
//   try {
//     const { faultReportId, status } = req.body;

//     if (!faultReportId || !status) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const faultReportsCollection = db.collection("fault_reports");

//     const result = await faultReportsCollection.updateOne(
//       { _id: new ObjectId(faultReportId) },
//       { $set: { status, updatedAt: new Date() } },
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Fault report not found" });
//     }

//     res.json({ success: true, message: "Status updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update status" });
//   }
// });

// /* =========================
//    Student Specific Records 
// ========================= */

// // 1. Get Housing History for a specific student
// app.get("/get-housing-history/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const housingRecordsCollection = db.collection("student_housing_records");

//     // Find all movement logs for this specific student ID
//     const history = await housingRecordsCollection
//       .find({ studentId: studentId })
//       .sort({ timestamp: -1 }) // Newest first
//       .toArray();

//     res.json(history);
//   } catch (error) {
//     console.error("Error fetching housing history:", error);
//     res.status(500).json({ message: "Failed to fetch housing history" });
//   }
// });

// // 2. Get Fault Reports for a specific room
// // Used to show maintenance logs on the profile page
// app.get("/get-room-faults/:house/:roomNumber", async (req, res) => {
//   try {
//     const { house, roomNumber } = req.params;
//     const faultReportsCollection = db.collection("fault_reports");

//     const reports = await faultReportsCollection
//       .find({
//         house: house,
//         roomNumber: roomNumber,
//       })
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.json(reports);
//   } catch (error) {
//     console.error("Error fetching room faults:", error);
//     res.status(500).json({ message: "Failed to fetch room maintenance logs" });
//   }
// });

// /* =========================
//    Rental Records Routes
// ========================= */

// app.post("/add-rental-record", async (req, res) => {
//   try {
//     const { studentId, month, proofOfPaymentUrl, approvedBy, status } =
//       req.body;

//     if (!studentId || !month || !proofOfPaymentUrl || !approvedBy) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const rentalRecordsCollection = db.collection("rental_records");

//     // Check if record already exists for this student and month
//     const existing = await rentalRecordsCollection.findOne({
//       studentId,
//       month,
//     });

//     if (existing) {
//       return res
//         .status(400)
//         .json({ message: "Payment record already exists for this month" });
//     }

//     const result = await rentalRecordsCollection.insertOne({
//       studentId,
//       month,
//       proofOfPaymentUrl,
//       approvedBy,
//       status: status || "Paid",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     // Update user's rent status to Paid
//     await usersCollection.updateOne(
//       { studentId },
//       { $set: { rentStatus: "Paid", lastPaymentDate: new Date() } },
//     );

//     res.json({ success: true, recordId: result.insertedId });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to add rental record" });
//   }
// });

// app.get("/get-rental-records/:studentId", async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const rentalRecordsCollection = db.collection("rental_records");

//     const records = await rentalRecordsCollection
//       .find({ studentId })
//       .sort({ month: -1 })
//       .toArray();

//     res.json(records);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch rental records" });
//   }
// });

// /* =========================
//    Attendance Routes
// ========================= */

// app.post("/clock-in", async (req, res) => {
//   try {
//     const { username } = req.body;

//     if (!username) {
//       return res.status(400).json({ message: "Username required" });
//     }

//     const attendanceCollection = db.collection("attendance_records");

//     // Check if user already clocked in today
//     const today = new Date().toISOString().split("T")[0];
//     const existingRecord = await attendanceCollection.findOne({
//       username,
//       date: today,
//     });

//     if (existingRecord && existingRecord.clockIn) {
//       return res
//         .status(400)
//         .json({ message: "You have already clocked in today" });
//     }

//     const now = new Date();
//     const clockInTime = now.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//     // Determine status based on time (8:00 AM threshold)
//     const hours = now.getHours();
//     const minutes = now.getMinutes();
//     const isLate = hours > 8 || (hours === 8 && minutes > 0);

//     const status = isLate ? "Late" : "Present";

//     const result = await attendanceCollection.insertOne({
//       username,
//       date: today,
//       clockIn: clockInTime,
//       clockInTimestamp: now,
//       clockOut: null,
//       clockOutTimestamp: null,
//       status,
//       createdAt: now,
//     });

//     res.json({
//       success: true,
//       recordId: result.insertedId,
//       clockInTime,
//       status,
//       message: `Clocked in successfully at ${clockInTime}`,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to clock in" });
//   }
// });

// app.post("/clock-out", async (req, res) => {
//   try {
//     const { username } = req.body;

//     if (!username) {
//       return res.status(400).json({ message: "Username required" });
//     }

//     const attendanceCollection = db.collection("attendance_records");

//     // Find today's record
//     const today = new Date().toISOString().split("T")[0];
//     const record = await attendanceCollection.findOne({
//       username,
//       date: today,
//     });

//     if (!record) {
//       return res
//         .status(400)
//         .json({ message: "No clock-in record found for today" });
//     }

//     if (record.clockOut) {
//       return res
//         .status(400)
//         .json({ message: "You have already clocked out today" });
//     }

//     const now = new Date();
//     const clockOutTime = now.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//     await attendanceCollection.updateOne(
//       { _id: record._id },
//       {
//         $set: {
//           clockOut: clockOutTime,
//           clockOutTimestamp: now,
//           updatedAt: now,
//         },
//       },
//     );

//     res.json({
//       success: true,
//       clockOutTime,
//       message: `Clocked out successfully at ${clockOutTime}`,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to clock out" });
//   }
// });

// app.get("/get-attendance/:username", async (req, res) => {
//   try {
//     const { username } = req.params;
//     const { filter } = req.query; // 'week', 'month', '3months', 'all'

//     if (!username) {
//       return res.status(400).json({ message: "Username required" });
//     }

//     const attendanceCollection = db.collection("attendance_records");

//     // Calculate date range based on filter
//     let dateFilter = {};
//     const today = new Date();

//     if (filter === "week") {
//       const weekAgo = new Date(today);
//       weekAgo.setDate(today.getDate() - 7);
//       dateFilter = { date: { $gte: weekAgo.toISOString().split("T")[0] } };
//     } else if (filter === "month") {
//       const monthAgo = new Date(today);
//       monthAgo.setMonth(today.getMonth() - 1);
//       dateFilter = { date: { $gte: monthAgo.toISOString().split("T")[0] } };
//     } else if (filter === "3months") {
//       const threeMonthsAgo = new Date(today);
//       threeMonthsAgo.setMonth(today.getMonth() - 3);
//       dateFilter = {
//         date: { $gte: threeMonthsAgo.toISOString().split("T")[0] },
//       };
//     }

//     const records = await attendanceCollection
//       .find({ username, ...dateFilter })
//       .sort({ date: -1 })
//       .toArray();

//     res.json(records);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch attendance records" });
//   }
// });

// app.get("/get-attendance-status/:username", async (req, res) => {
//   try {
//     const { username } = req.params;
//     const attendanceCollection = db.collection("attendance_records");

//     const today = new Date().toISOString().split("T")[0];
//     const record = await attendanceCollection.findOne({
//       username,
//       date: today,
//     });

//     res.json({
//       isClockedIn: record && record.clockIn && !record.clockOut,
//       todayRecord: record || null,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to check attendance status" });
//   }
// });

// /* =========================
//    Employee Management Routes
// ========================= */

// // 1. Get all users but filter for Employees/Staff only
// app.get("/get-all-employees", async (req, res) => {
//   try {
//     // Filter: Fetch all users EXCEPT those with userType "student"

//     const employees = await usersCollection
//       .find({ userType: { $ne: "student" } })
//       .sort({ username: 1 })
//       .toArray();

//     // Remove sensitive data (passwords) before sending
//     const safeEmployees = employees.map((emp) => {
//       const { hashedPassword, ...rest } = emp;
//       return rest;
//     });

//     res.json(safeEmployees);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch staff directory" });
//   }
// });

// // 2. Get a single user by their MongoDB _id (used for routing to profiles)
// app.get("/get-user-by-id/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid User ID format" });
//     }

//     const user = await usersCollection.findOne({ _id: new ObjectId(id) });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const { hashedPassword, ...userWithoutPassword } = user;
//     res.json(userWithoutPassword);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // 3. Get Staff Counts by Position (for the Stats Cards)
// app.get("/get-staff-stats", async (req, res) => {
//   try {
//     const totalStaff = await usersCollection.countDocuments({
//       userType: { $ne: "student" },
//     });

//     const adminRoles = ["Principal Tutor", "Head Matron", "Allocation Officer"];
//     const admins = await usersCollection.countDocuments({
//       position: { $in: adminRoles },
//     });

//     const wardens = await usersCollection.countDocuments({
//       position: "Warden",
//     });

//     res.json({
//       total: totalStaff,
//       admins: admins,
//       wardens: wardens,
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch stats" });
//   }
// });

// // 4. Get Employee Timesheet with Duration
// app.get("/get-employee-timesheet/:username", async (req, res) => {
//   try {
//     const { username } = req.params;
//     const attendanceCollection = db.collection("attendance_records");

//     const records = await attendanceCollection
//       .find({ username })
//       .sort({ date: -1 })
//       .limit(30) // Last 30 days
//       .toArray();

//     // Calculate duration for each record
//     const enhancedRecords = records.map((record) => {
//       let duration = "N/A";
//       if (record.clockInTimestamp && record.clockOutTimestamp) {
//         const diff =
//           new Date(record.clockOutTimestamp) -
//           new Date(record.clockInTimestamp);
//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         duration = `${hours}h ${minutes}m`;
//       }
//       return { ...record, duration };
//     });

//     res.json(enhancedRecords);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch timesheet" });
//   }
// });

// /* Check if student has paid for a specific month */
// app.get("/check-rental-status/:studentId/:month", async (req, res) => {
//   try {
//     const { studentId, month } = req.params;
//     const rentalRecordsCollection = db.collection("rental_records");

//     const record = await rentalRecordsCollection.findOne({
//       studentId,
//       month,
//     });

//     res.json({
//       hasPaid: !!record,
//       record: record || null,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to check rental status" });
//   }
// });

// /* =========================
//    Facility Reports Routes
// ========================= */

// app.post("/add-facility-report", upload.single("image"), async (req, res) => {
//   try {
//     const {
//       dorm,
//       facilityType,
//       title,
//       description,
//       discoveryDate,
//       reportedBy,
//       status,
//     } = req.body;

//     if (!dorm || !facilityType || !title || !discoveryDate || !reportedBy) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const facilityReportsCollection = db.collection("facilities_reports");

//     // Generate facility report ID (e.g., FCR-2026-001)
//     const year = new Date().getFullYear();
//     const count = await facilityReportsCollection.countDocuments();
//     const facilityReportId = `FCR-${year}-${String(count + 1).padStart(3, "0")}`;

//     // Upload image to Cloudinary if provided
//     let imageUrl = null;
//     if (req.file) {
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: "facility_reports",
//       });
//       fs.unlinkSync(req.file.path);
//       imageUrl = result.secure_url;
//     }

//     const result = await facilityReportsCollection.insertOne({
//       facilityReportId,
//       dorm,
//       facilityType,
//       title,
//       description: description || "",
//       discoveryDate,
//       reportedBy,
//       imageUrl,
//       status: status || "Pending",
//       createdAt: new Date(),
//     });

//     // ✅ Send notification email
//     await sendReportNotificationEmail(
//       "facility",
//       {
//         facilityReportId,
//         dorm,
//         facilityType,
//         title,
//         description,
//         discoveryDate,
//         reportedBy,
//         status,
//       },
//       imageUrl,
//     );

//     res.json({ success: true, facilityReportId: result.insertedId });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to add facility report" });
//   }
// });

// app.get("/get-facility-reports", async (req, res) => {
//   try {
//     const facilityReportsCollection = db.collection("facilities_reports");
//     const reports = await facilityReportsCollection
//       .find({})
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.json(reports);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch facility reports" });
//   }
// });

// app.put("/update-facility-report-status", async (req, res) => {
//   try {
//     const { facilityReportId, status } = req.body;

//     if (!facilityReportId || !status) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const facilityReportsCollection = db.collection("facilities_reports");

//     const result = await facilityReportsCollection.updateOne(
//       { _id: new ObjectId(facilityReportId) },
//       { $set: { status, updatedAt: new Date() } },
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Facility report not found" });
//     }

//     res.json({ success: true, message: "Status updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update status" });
//   }
// });

// /* =========================
//    User Notifications Routes
// ========================= */

// // Helper function to create a notification
// async function createNotification(userId, username, notificationType, message) {
//   try {
//     const notificationsCollection = db.collection("user_notifications");

//     await notificationsCollection.insertOne({
//       userId,
//       username,
//       notificationType,
//       message,
//       timestamp: new Date(),
//       read: false,
//     });
//   } catch (error) {
//     console.error("Error creating notification:", error);
//   }
// }

// // Get notifications for a user
// app.get("/get-notifications/:username", async (req, res) => {
//   try {
//     const { username } = req.params;
//     const notificationsCollection = db.collection("user_notifications");

//     const notifications = await notificationsCollection
//       .find({ username })
//       .sort({ timestamp: -1 })
//       .toArray();

//     res.json(notifications);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch notifications" });
//   }
// });

// // Mark notification as read
// app.put("/mark-notification-read/:notificationId", async (req, res) => {
//   try {
//     const { notificationId } = req.params;
//     const notificationsCollection = db.collection("user_notifications");

//     const result = await notificationsCollection.updateOne(
//       { _id: new ObjectId(notificationId) },
//       { $set: { read: true } },
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Notification not found" });
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update notification" });
//   }
// });

// /* =========================
//    Maintenance Notices Routes
// ========================= */

// // Add a new maintenance notice (from fault report)
// app.post("/add-maintenance-notice", async (req, res) => {
//   try {
//     console.log("Received maintenance notice data:", JSON.stringify(req.body));

//     const houseName = req.body.houseName || req.body.house;
//     const problemTitle = req.body.problemTitle || req.body.title;
//     const maintenanceDate = req.body.maintenanceDate || req.body.plannedDate;
//     const reportedBy = req.body.reportedBy;
//     const reportId = req.body.reportId || req.body.faultReportId;
//     // const roomNumber = req.body.roomNumber;
//     const status = req.body.status;
//     const additionalNotes = req.body.additionalNotes || req.body.notes;

//     if (!houseName || !problemTitle || !maintenanceDate || !reportedBy) {
//       console.log(
//         "Missing fields - houseName:",
//         houseName,
//         "problemTitle:",
//         problemTitle,
//         "maintenanceDate:",
//         maintenanceDate,
//         "reportedBy:",
//         reportedBy,
//       );
//       return res.status(400).json({
//         message: "Missing required fields",
//         missing: {
//           houseName: !houseName,
//           problemTitle: !problemTitle,
//           maintenanceDate: !maintenanceDate,
//           reportedBy: !reportedBy,
//         },
//       });
//     }

//     const maintenanceNoticesCollection = db.collection("maintenance_notices");

//     // Generate maintenance notice ID (e.g., MN-2026-001)
//     const year = new Date().getFullYear();
//     const count = await maintenanceNoticesCollection.countDocuments();
//     const maintenanceNoticeId = `MN-${year}-${String(count + 1).padStart(3, "0")}`;

//     // Calculate initial progress based on status
//     let progress = 0;
//     if (status === "In Progress") progress = 50;
//     if (status === "Urgent") progress = 25;
//     if (status === "Awaiting Parts") progress = 30;
//     if (status === "Completed") progress = 100;

//     const result = await maintenanceNoticesCollection.insertOne({
//       maintenanceNoticeId,
//       faultReportId: reportId || null, // Using reportId
//       title: problemTitle, // Using problemTitle
//       house: houseName, // Using houseName
//       // roomNumber: roomNumber || null,
//       // location: roomNumber ? `${houseName} - ${roomNumber}` : houseName,
//       plannedDate: maintenanceDate, // Using maintenanceDate
//       scheduledDate: maintenanceDate, // Using maintenanceDate
//       completedDate: status === "Completed" ? new Date() : null,
//       notes: additionalNotes || "", // Using additionalNotes
//       description: additionalNotes || "", // Using additionalNotes
//       status: status || "Scheduled",
//       progress,
//       assignedTo: "Maintenance Team",
//       reportedBy,
//       createdAt: new Date(),
//     });

//     // If linked to a fault report, update the fault report status
//     if (reportId) {
//       // Using reportId
//       const faultReportsCollection = db.collection("fault_reports");
//       await faultReportsCollection.updateOne(
//         { _id: new ObjectId(reportId) }, // Using reportId
//         {
//           $set: {
//             status: "In Progress",
//             maintenanceNoticeId: maintenanceNoticeId,
//             updatedAt: new Date(),
//           },
//         },
//       );
//     }

//     res.json({
//       success: true,
//       maintenanceNoticeId: result.insertedId,
//       message: "Maintenance notice created successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to add maintenance notice" });
//   }
// });

// // Get all maintenance notices
// app.get("/get-maintenance-notices", async (req, res) => {
//   try {
//     const maintenanceNoticesCollection = db.collection("maintenance_notices");
//     const notices = await maintenanceNoticesCollection
//       .find({})
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.json(notices);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch maintenance notices" });
//   }
// });

// // Update maintenance notice status and progress
// app.put("/update-maintenance-notice-status", async (req, res) => {
//   try {
//     const { maintenanceNoticeId, status, progress, notes } = req.body;

//     if (!maintenanceNoticeId || !status) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const maintenanceNoticesCollection = db.collection("maintenance_notices");

//     const updateData = {
//       status,
//       updatedAt: new Date(),
//     };

//     // Update progress if provided, otherwise auto-calculate
//     if (progress !== undefined) {
//       updateData.progress = progress;
//     } else {
//       if (status === "Scheduled") updateData.progress = 0;
//       if (status === "Urgent") updateData.progress = 25;
//       if (status === "Awaiting Parts") updateData.progress = 30;
//       if (status === "In Progress") updateData.progress = 50;
//       if (status === "Completed") updateData.progress = 100;
//     }

//     // Update notes if provided
//     if (notes) {
//       updateData.notes = notes;
//       updateData.description = notes;
//     }

//     // Set completed date if status is Completed
//     if (status === "Completed") {
//       updateData.completedDate = new Date();
//     }

//     const result = await maintenanceNoticesCollection.updateOne(
//       { _id: new ObjectId(maintenanceNoticeId) },
//       { $set: updateData },
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Maintenance notice not found" });
//     }

//     // If completed, also update the linked fault report if exists
//     if (status === "Completed") {
//       const notice = await maintenanceNoticesCollection.findOne({
//         _id: new ObjectId(maintenanceNoticeId),
//       });

//       if (notice.faultReportId) {
//         const faultReportsCollection = db.collection("fault_reports");
//         await faultReportsCollection.updateOne(
//           { _id: new ObjectId(notice.faultReportId) },
//           { $set: { status: "Fixed", updatedAt: new Date() } },
//         );
//       }
//     }

//     res.json({ success: true, message: "Status updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update status" });
//   }
// });

// // Get a single maintenance notice by ID
// app.get("/get-maintenance-notice/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid ID format" });
//     }

//     const maintenanceNoticesCollection = db.collection("maintenance_notices");
//     const notice = await maintenanceNoticesCollection.findOne({
//       _id: new ObjectId(id),
//     });

//     if (!notice) {
//       return res.status(404).json({ error: "Maintenance notice not found" });
//     }

//     res.json(notice);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch maintenance notice" });
//   }
// });

// // Get maintenance notices for a specific fault report
// app.get(
//   "/get-maintenance-notices-by-fault/:faultReportId",
//   async (req, res) => {
//     try {
//       const { faultReportId } = req.params;

//       const maintenanceNoticesCollection = db.collection("maintenance_notices");
//       const notices = await maintenanceNoticesCollection
//         .find({ faultReportId })
//         .sort({ createdAt: -1 })
//         .toArray();

//       res.json(notices);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Failed to fetch maintenance notices" });
//     }
//   },
// );

// /* =========================
//    Password Reset Route
// ========================= */

// app.post("/reset-password", async (req, res) => {
//   console.log("Password reset request received");

//   try {
//     const { id, email, newPassword, confirmPassword } = req.body;

//     // Validate required fields
//     if (!id || !email || !newPassword || !confirmPassword) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if passwords match
//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // Validate password length
//     if (newPassword.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters long" });
//     }

//     // Find user with matching credentials
//     const user = await usersCollection.findOne({
//       $or: [{ staffId: id }, { studentId: id }],
//       email: email,
//     });

//     // Check if user exists with matching credentials
//     if (!user) {
//       return res.status(404).json({
//         message: "Invalid credentials. Please verify your ID and Email.",
//       });
//     }

//     // Hash the new password
//     const hashedPassword = await encryptPassword(newPassword);

//     // Update the password
//     const result = await usersCollection.updateOne(
//       { _id: user._id },
//       {
//         $set: {
//           hashedPassword: hashedPassword,
//           passwordUpdatedAt: new Date(),
//         },
//       },
//     );

//     if (result.modifiedCount === 0) {
//       return res.status(500).json({ message: "Failed to update password" });
//     }

//     // ✅ Send password reset confirmation email
//     await sendPasswordResetEmail(user.email, user.username);

//     res.json({
//       success: true,
//       message: "Password reset successfully",
//       username: user.username,
//       userType: user.userType,
//       userId: user.staffId || user.studentId || null,
//     });
//   } catch (error) {
//     console.error("Password reset error:", error);
//     res.status(500).json({ message: "Password reset failed" });
//   }
// });

// /* =========================
//     staff requests
//   ==========================
//   */
// app.post("/add-staff-request", async (req, res) => {
//   try {
//     const { username, type, description } = req.body;

//     if (!username || !type || !description) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const staffRequestsCollection = db.collection("staff_requests");

//     const result = await staffRequestsCollection.insertOne({
//       username,
//       type,
//       description,
//       status: "Pending",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       statusUpdatedBy: null,
//       statusUpdatedAt: null,
//     });

//     res.json({
//       success: true,
//       requestId: result.insertedId,
//       message: "Request submitted successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to submit request" });
//   }
// });

// app.get("/get-staff-requests/:username", async (req, res) => {
//   try {
//     const { username } = req.params;

//     if (!username) {
//       return res.status(400).json({ message: "Username required" });
//     }

//     const staffRequestsCollection = db.collection("staff_requests");

//     const requests = await staffRequestsCollection
//       .find({ username })
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.json(requests);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch requests" });
//   }
// });

// app.get("/get-all-staff-requests", async (req, res) => {
//   try {
//     const staffRequestsCollection = db.collection("staff_requests");

//     const requests = await staffRequestsCollection
//       .find({})
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.json(requests);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch staff requests" });
//   }
// });

// app.put("/update-staff-request-status", async (req, res) => {
//   try {
//     const { requestId, status, updatedBy } = req.body;

//     if (!requestId || !status || !updatedBy) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const staffRequestsCollection = db.collection("staff_requests");

//     const result = await staffRequestsCollection.updateOne(
//       { _id: new ObjectId(requestId) },
//       {
//         $set: {
//           status,
//           statusUpdatedBy: updatedBy,
//           statusUpdatedAt: new Date(),
//           updatedAt: new Date(),
//         },
//       },
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     res.json({
//       success: true,
//       message: "Request status updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to update request status" });
//   }
// });

// /* =========================
//    Email Functions
// ========================= */

// async function sendWelcomeEmail(email, username) {
//   const mailOptions = {
//     from: `"Parirenyatwa Nursing School" <admin@pari-nursing-school.org>`,
//     to: email,
//     subject: "Welcome to Parirenyatwa Nursing School Information System",
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body {
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             max-width: 600px;
//             margin: 0 auto;
//             padding: 20px;
//           }
//           .header {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             padding: 30px;
//             text-align: center;
//             border-radius: 10px 10px 0 0;
//           }
//           .header h1 {
//             margin: 0;
//             font-size: 24px;
//           }
//           .content {
//             background: #f9f9f9;
//             padding: 30px;
//             border-radius: 0 0 10px 10px;
//           }
//           .welcome-message {
//             background: white;
//             padding: 20px;
//             border-radius: 8px;
//             margin-bottom: 20px;
//             border-left: 4px solid #667eea;
//           }
//           .info-box {
//             background: white;
//             padding: 15px;
//             border-radius: 8px;
//             margin: 15px 0;
//           }
//           .footer {
//             text-align: center;
//             margin-top: 30px;
//             padding-top: 20px;
//             border-top: 1px solid #ddd;
//             color: #666;
//             font-size: 14px;
//           }
//           .button {
//             display: inline-block;
//             padding: 12px 30px;
//             background: #667eea;
//             color: white;
//             text-decoration: none;
//             border-radius: 5px;
//             margin: 15px 0;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h1>🎓 Welcome to Parirenyatwa Nursing School</h1>
//           <p style="margin: 5px 0 0 0;">Information Management System</p>
//         </div>

//         <div class="content">
//           <div class="welcome-message">
//             <h2 style="color: #667eea; margin-top: 0;">Hello ${username}!</h2>
//             <p>We're excited to welcome you to the Parirenyatwa Nursing School Information System. Your account has been successfully created!</p>
//           </div>

//           <div class="info-box">
//             <h3 style="color: #333; margin-top: 0;">✅ What's Next?</h3>
//             <ul style="color: #666;">
//               <li>Log in to your account using your username and password</li>
//               <li>Complete your profile information</li>
//               <li>Explore the dashboard and available features</li>
//               <li>Check notices and upcoming events</li>
//             </ul>
//           </div>

//           <div class="info-box">
//             <h3 style="color: #333; margin-top: 0;">🔐 Account Security</h3>
//             <p style="color: #666; margin: 0;">
//               Please keep your login credentials secure and do not share them with anyone. 
//               If you need to reset your password, you can do so from the login page.
//             </p>
//           </div>

//           <div style="text-align: center; margin: 25px 0;">
//             <a href="https://pari-nursing-school.org" class="button">
//               Access Your Account
//             </a>
//           </div>

//           <div class="info-box">
//             <h3 style="color: #333; margin-top: 0;">📞 Need Help?</h3>
//             <p style="color: #666; margin: 0;">
//               If you have any questions or need assistance, please contact our support team 
//               or reach out to your program administrator.
//             </p>
//           </div>
//         </div>

//         <div class="footer">
//           <p><strong>Parirenyatwa Nursing School</strong></p>
//           <p style="margin: 5px 0;">Excellence in Nursing Education</p>
//           <p style="margin: 5px 0; font-size: 12px;">
//             This is an automated message. Please do not reply to this email.
//           </p>
//         </div>
//       </body>
//       </html>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Welcome email sent to ${email}`);
//   } catch (error) {
//     console.error("❌ Error sending welcome email:", error.message);
//   }
// }

// async function sendHousingEmail(email, username, action, details) {
//   const actionConfig = {
//     assigned: {
//       subject: "Room Assignment - Parirenyatwa Nursing School",
//       color: "#10B981",
//       icon: "🏠",
//       heading: "Room Assignment Confirmation",
//       message: `You have been successfully assigned to a room.`,
//     },
//     moved: {
//       subject: "Room Transfer - Parirenyatwa Nursing School",
//       color: "#2563EB",
//       icon: "🔄",
//       heading: "Room Transfer Confirmation",
//       message: `Your room assignment has been updated.`,
//     },
//     deactivated: {
//       subject: "Room Deactivation - Parirenyatwa Nursing School",
//       color: "#EF4444",
//       icon: "📦",
//       heading: "Room Deactivation Notice",
//       message: `Your room assignment has been deactivated.`,
//     },
//   };

//   const config = actionConfig[action];

//   const detailsHTML = Object.entries(details)
//     .map(
//       ([key, value]) => `
//       <tr>
//         <td style="padding: 10px; font-weight: bold; color: #374151; background: #F9FAFB; border: 1px solid #E5E7EB; width: 40%">${key}</td>
//         <td style="padding: 10px; color: #6B7280; border: 1px solid #E5E7EB;">${value}</td>
//       </tr>`,
//     )
//     .join("");

//   const mailOptions = {
//     from: `"Parirenyatwa Nursing School" <admin@pari-nursing-school.org>`,
//     to: email,
//     subject: config.subject,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//         </style>
//       </head>
//       <body>
//         <div style="background: linear-gradient(135deg, ${config.color}, ${config.color}cc); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
//           <h1 style="margin: 0; font-size: 24px;">${config.icon} ${config.heading}</h1>
//           <p style="margin: 8px 0 0 0; opacity: 0.9;">Parirenyatwa Nursing School</p>
//         </div>

//         <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${config.color};">
//             <h2 style="color: ${config.color}; margin-top: 0;">Hello ${username}!</h2>
//             <p style="color: #4B5563; margin: 0;">${config.message}</p>
//           </div>

//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//             <h3 style="color: #111827; margin-top: 0;">📋 Assignment Details</h3>
//             <table style="width: 100%; border-collapse: collapse;">
//               ${detailsHTML}
//             </table>
//           </div>

//           <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
//             <p style="color: #92400E; margin: 0; font-size: 0.9rem;">
//               ⚠️ If you believe this is an error or have any concerns, please contact your warden or the allocation office immediately.
//             </p>
//           </div>
//         </div>

//         <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #9CA3AF; font-size: 13px;">
//           <p><strong style="color: #374151;">Parirenyatwa Nursing School</strong></p>
//           <p style="margin: 4px 0;">Excellence in Nursing Education</p>
//           <p style="margin: 4px 0; font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
//         </div>
//       </body>
//       </html>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Housing ${action} email sent to ${email}`);
//   } catch (error) {
//     console.error(`❌ Error sending housing email:`, error.message);
//   }
// }

// /* =========================
//    Maintenance Reports Routes
//    (Technician visit logs)
// ========================= */

// // Add a new maintenance report (with optional image upload)
// app.post(
//   "/add-maintenance-report",
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const {
//         house,
//         roomNumber,
//         item,
//         details,
//         technicianName,
//         workDone,
//         status,
//         visitDate,
//         nextVisitDate,
//         reportedBy,
//       } = req.body;

//       if (!house || !item || !visitDate || !technicianName) {
//         return res.status(400).json({ message: "Missing required fields" });
//       }

//       const maintenanceReportsCollection = db.collection("maintenance_reports");

//       // Generate report ID e.g. MR-2026-001
//       const year = new Date().getFullYear();
//       const count = await maintenanceReportsCollection.countDocuments();
//       const reportId = `MR-${year}-${String(count + 1).padStart(3, "0")}`;

//       // Upload image to Cloudinary if provided
//       let imageUrl = null;
//       if (req.file) {
//         const result = await cloudinary.uploader.upload(req.file.path, {
//           folder: "maintenance_reports",
//         });
//         fs.unlinkSync(req.file.path);
//         imageUrl = result.secure_url;
//       }

//       const result = await maintenanceReportsCollection.insertOne({
//         reportId,
//         house,
//         roomNumber: roomNumber || null,
//         item,
//         details: details || "",
//         technicianName,
//         workDone: workDone || "",
//         status: status || "In Progress",
//         visitDate,
//         nextVisitDate: nextVisitDate || null,
//         imageUrl,
//         reportedBy: reportedBy || "Technician",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });

//       res.json({ success: true, reportId: result.insertedId });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Failed to add maintenance report" });
//     }
//   },
// );

// // Get all maintenance reports
// app.get("/get-maintenance-reports", async (req, res) => {
//   try {
//     const maintenanceReportsCollection = db.collection("maintenance_reports");
//     const reports = await maintenanceReportsCollection
//       .find({})
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.json(reports);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch maintenance reports" });
//   }
// });

// // Update a maintenance report (with optional new image)
// app.put(
//   "/update-maintenance-report/:id",
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const { id } = req.params;

//       if (!ObjectId.isValid(id)) {
//         return res.status(400).json({ error: "Invalid report ID" });
//       }

//       const {
//         house,
//         roomNumber,
//         item,
//         details,
//         technicianName,
//         workDone,
//         status,
//         visitDate,
//         nextVisitDate,
//       } = req.body;

//       const maintenanceReportsCollection = db.collection("maintenance_reports");

//       const updateData = {
//         updatedAt: new Date(),
//       };

//       if (house) updateData.house = house;
//       if (roomNumber) updateData.roomNumber = roomNumber;
//       if (item) updateData.item = item;
//       if (details) updateData.details = details;
//       if (technicianName) updateData.technicianName = technicianName;
//       if (workDone) updateData.workDone = workDone;
//       if (status) updateData.status = status;
//       if (visitDate) updateData.visitDate = visitDate;
//       if (nextVisitDate) updateData.nextVisitDate = nextVisitDate;

//       // Upload new image if provided
//       if (req.file) {
//         const result = await cloudinary.uploader.upload(req.file.path, {
//           folder: "maintenance_reports",
//         });
//         fs.unlinkSync(req.file.path);
//         updateData.imageUrl = result.secure_url;
//       }

//       const result = await maintenanceReportsCollection.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: updateData },
//       );

//       if (result.matchedCount === 0) {
//         return res.status(404).json({ message: "Report not found" });
//       }

//       res.json({ success: true, message: "Report updated successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Failed to update report" });
//     }
//   },
// );

// /* Sending email to maintenance dashboard */
// async function sendReportNotificationEmail(reportType, reportData, imageUrl) {
//   const isFaultReport = reportType === "fault";

//   const config = {
//     subject: isFaultReport
//       ? `New Fault Report ${reportData.faultReportId} - ${reportData.house}`
//       : `New Facility Report ${reportData.facilityReportId} - ${reportData.dorm}`,
//     icon: isFaultReport ? "🔧" : "🏗️",
//     heading: isFaultReport
//       ? "Fault Report Submitted"
//       : "Facility Damage Report Submitted",
//     color: isFaultReport ? "#F59E0B" : "#EF4444",
//   };

//   const detailsHTML = isFaultReport
//     ? `
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;width:40%">Report ID</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.faultReportId}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">House</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.house}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Room Number</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.roomNumber}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Item</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.item}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Details</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.details || "N/A"}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Discovery Date</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.discoveryDate}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Reported By</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.reportedBy}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Status</td><td style="padding:10px;border:1px solid #E5E7EB;">Pending</td></tr>
//     `
//     : `
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;width:40%">Report ID</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.facilityReportId}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Dorm</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.dorm}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Facility Type</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.facilityType}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Title</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.title}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Description</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.description || "N/A"}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Discovery Date</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.discoveryDate}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Reported By</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.reportedBy}</td></tr>
//       <tr><td style="padding:10px;font-weight:bold;background:#F9FAFB;border:1px solid #E5E7EB;">Status</td><td style="padding:10px;border:1px solid #E5E7EB;">${reportData.status || "Pending"}</td></tr>
//     `;

//   const imageHTML = imageUrl
//     ? `
//       <div style="background:white;padding:20px;border-radius:8px;margin-bottom:20px;">
//         <h3 style="color:#111827;margin-top:0;">📷 Attached Image</h3>
//         <img src="${imageUrl}" alt="Report Image" style="max-width:100%;border-radius:8px;border:1px solid #E5E7EB;" />
//       </div>
//     `
//     : "";

//   const mailOptions = {
//     from: `"Parirenyatwa Nursing School" <admin@pari-nursing-school.org>`,
//     to: process.env.REPORT_NOTIFICATION_EMAIL,
//     subject: config.subject,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//         </style>
//       </head>
//       <body>
//         <div style="background:linear-gradient(135deg, ${config.color}, ${config.color}cc);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0;">
//           <h1 style="margin:0;font-size:24px;">${config.icon} ${config.heading}</h1>
//           <p style="margin:8px 0 0 0;opacity:0.9;">Parirenyatwa Nursing School</p>
//         </div>

//         <div style="background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px;">
//           <div style="background:white;padding:20px;border-radius:8px;margin-bottom:20px;border-left:4px solid ${config.color};">
//             <p style="color:#4B5563;margin:0;">A new ${isFaultReport ? "fault" : "facility damage"} report has been submitted and requires your attention.</p>
//           </div>

//           <div style="background:white;padding:20px;border-radius:8px;margin-bottom:20px;">
//             <h3 style="color:#111827;margin-top:0;">📋 Report Details</h3>
//             <table style="width:100%;border-collapse:collapse;">
//               ${detailsHTML}
//             </table>
//           </div>

//           ${imageHTML}

//           <div style="background:white;padding:15px;border-radius:8px;border-left:4px solid #F59E0B;">
//             <p style="color:#92400E;margin:0;font-size:0.9rem;">
//               ⚠️ Please review and assign a maintenance team as soon as possible.
//             </p>
//           </div>
//         </div>

//         <div style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #ddd;color:#9CA3AF;font-size:13px;">
//           <p><strong style="color:#374151;">Parirenyatwa Nursing School</strong></p>
//           <p style="margin:4px 0;">Excellence in Nursing Education</p>
//           <p style="margin:4px 0;font-size:11px;">This is an automated message. Please do not reply to this email.</p>
//         </div>
//       </body>
//       </html>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Report notification email sent for ${reportType} report`);
//   } catch (error) {
//     console.error(`❌ Error sending report notification email:`, error.message);
//   }
// }

// async function sendPasswordResetEmail(email, username) {
//   const mailOptions = {
//     from: `"Parirenyatwa Nursing School" <admin@pari-nursing-school.org>`,
//     to: email,
//     subject: "Password Reset Confirmation - Parirenyatwa Nursing School",
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//         </style>
//       </head>
//       <body>
//         <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
//           <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset Confirmation</h1>
//           <p style="margin: 8px 0 0 0; opacity: 0.9;">Parirenyatwa Nursing School</p>
//         </div>

//         <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3B82F6;">
//             <h2 style="color: #3B82F6; margin-top: 0;">Hello ${username}!</h2>
//             <p style="color: #4B5563; margin: 0;">Your password has been successfully reset. You can now log in using your new password.</p>
//           </div>

//           <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//             <h3 style="color: #111827; margin-top: 0;">📋 Reset Details</h3>
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr>
//                 <td style="padding: 10px; font-weight: bold; background: #F9FAFB; border: 1px solid #E5E7EB; width: 40%">Username</td>
//                 <td style="padding: 10px; border: 1px solid #E5E7EB;">${username}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px; font-weight: bold; background: #F9FAFB; border: 1px solid #E5E7EB;">Date & Time</td>
//                 <td style="padding: 10px; border: 1px solid #E5E7EB;">${new Date().toLocaleString(
//                   "en-US",
//                   {
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                     hour: "2-digit",
//                     minute: "2-digit",
//                     hour12: true,
//                   },
//                 )}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 10px; font-weight: bold; background: #F9FAFB; border: 1px solid #E5E7EB;">Status</td>
//                 <td style="padding: 10px; border: 1px solid #E5E7EB; color: #10B981; font-weight: bold;">✅ Successful</td>
//               </tr>
//             </table>
//           </div>

//           <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
//             <p style="color: #92400E; margin: 0; font-size: 0.9rem;">
//               ⚠️ If you did not request this password reset, please contact your administrator or warden immediately as your account may be compromised.
//             </p>
//           </div>
//         </div>

//         <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #9CA3AF; font-size: 13px;">
//           <p><strong style="color: #374151;">Parirenyatwa Nursing School</strong></p>
//           <p style="margin: 4px 0;">Excellence in Nursing Education</p>
//           <p style="margin: 4px 0; font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
//         </div>
//       </body>
//       </html>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Password reset confirmation email sent to ${email}`);
//   } catch (error) {
//     console.error("❌ Error sending password reset email:", error.message);
//   }
// }

// app.get("/check-super-user/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await usersCollection.findOne({
//       $or: [{ studentId: id }, { staffId: id }],
//     });

//     if (!user) {
//       return res.status(404).json({ isSuper: false });
//     }

//     res.json({ isSuper: user.super === "true" });
//   } catch (error) {
//     res.status(500).json({ isSuper: false });
//   }
// });

// app.get("/home", (req, res) => {
//   res.status(200).json("Welcome, your app is working well");
// });

// /* =========================
//    Server
// ========================= */

// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });

// startServer();

// // IMPORTANT: Export the app for Vercel
// module.exports = app;
