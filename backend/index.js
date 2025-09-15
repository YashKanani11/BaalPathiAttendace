import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { dbName: "Baal_Pathi_Attendance" })
  .then(() => console.log("Mongo DB Conencted"))
  .catch((err) => console.error(err));

// ----- Schemas & Models -----
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const nameSchema = new mongoose.Schema({
  name: { type: String, unique: true },
});
const attendanceSchema = new mongoose.Schema({
  nameId: String,
  name: String,
  time: String,
  date: String,
});
const User = mongoose.model("User", userSchema);
const Name = mongoose.model("Name", nameSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

// ----- Auth Middleware -----
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
};
// ----- Auth Routes -----
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ error: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashed });
  await newUser.save();

  res.json({ success: true });
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

// ----- Names -----
app.get("/names", authMiddleware, async (req, res) => {
  const names = await Name.find();
  res.json(names);
});

app.post("/names", authMiddleware, async (req, res) => {
  const nameStr = req.body.name?.trim();
  if (!nameStr) return res.status(400).json({ error: "Name is required" });

  try {
    const newName = new Name({ name: nameStr });
    await newName.save();
    res.json(newName);
  } catch {
    res.status(400).json({ error: "Name already exists" });
  }
});

// ----- Attendance -----
app.get("/attendance", authMiddleware, async (req, res) => {
  const records = await Attendance.find();
  res.json(records);
});

app.post("/attendance", authMiddleware, async (req, res) => {
  const { nameId, name, time, date } = req.body;
  const record = new Attendance({ nameId, name, time, date });
  await record.save();
  res.json({ success: true });
});

// ----- Start Server -----
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
