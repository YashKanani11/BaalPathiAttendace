import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const NAMES_FILE = "./names.json";
const ATTENDANCE_FILE = "./attendance.json";

// ----- Names -----
app.get("/names", (req, res) => {
  const data = JSON.parse(fs.readFileSync(NAMES_FILE));
  res.json(data);
});

app.post("/names", (req, res) => {
  const data = JSON.parse(fs.readFileSync(NAMES_FILE));
  const newName = { id: "u" + Date.now(), name: req.body.name };
  data.push(newName);
  fs.writeFileSync(NAMES_FILE, JSON.stringify(data, null, 2));
  res.json(newName);
});

// ----- Attendance -----
app.get("/attendance", (req, res) => {
  const data = JSON.parse(fs.readFileSync(ATTENDANCE_FILE));
  res.json(data);
});

app.post("/attendance", (req, res) => {
  const data = JSON.parse(fs.readFileSync(ATTENDANCE_FILE));
  data.push(req.body); // { id, name, time, date }
  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
