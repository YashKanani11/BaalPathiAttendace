import React from "react";
import { useEffect, useState } from "react";

export default function AttendanceForm({ onAdd }) {
  const [names, setNames] = useState([]);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0] // default today
  );

  useEffect(() => {
    fetch("http://localhost:4000/names")
      .then(res => res.json())
      .then(setNames);
  }, []);

  const handleSubmit = async () => {
    if (!name || !time) return;

    let existing = names.find(n => n.name.toLowerCase() === name.toLowerCase());
    let newEntry = existing;

    if (!existing) {
      const res = await fetch("http://localhost:4000/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      newEntry = await res.json();
      setNames([...names, newEntry]);
    }

    const record = { ...newEntry, time, date };
    // Save to backend
    await fetch("http://localhost:4000/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });

    onAdd(record);
    setName("");
    setTime("");
  };


  const filteredNames = names.filter(n =>
    n.name.toLowerCase().includes(name.toLowerCase())
  );

  return (
    <div className="p-4 flex flex-col gap-4 max-w-sm mx-auto">
      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        list="name-options"
        className="p-2 border rounded-lg"
      />
      <datalist id="name-options">
        {filteredNames.map(n => (
          <option key={n.id} value={n.name} />
        ))}
      </datalist>

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="p-2 border rounded-lg"
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={new Date().toISOString().split("T")[0]}  // 🚫 prevents future dates
        className="p-2 border rounded-lg"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Add Attendance
      </button>
    </div>
  );
}
