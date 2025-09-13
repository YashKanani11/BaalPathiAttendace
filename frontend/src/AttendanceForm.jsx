import React, { useEffect, useState } from "react";

export default function AttendanceForm({ names, setNames, onAdd }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");

  // Get local Kolkata date
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [date, setDate] = useState(localDate);

  // State for Sunday times: { id: "HH:MM" }
  const [sundayTimes, setSundayTimes] = useState({});

  // Check if selected date is Sunday (local)
  const dateParts = date.split("-");
  const localSelected = new Date(
    Number(dateParts[0]),
    Number(dateParts[1]) - 1,
    Number(dateParts[2])
  );
  const isSunday = localSelected.getDay() === 0;

  const handleSubmit = async () => {
    if (!name || !time) return;

    // Check if name exists
    let existing = names.find(n => n.name.toLowerCase() === name.toLowerCase());
    let newEntry = existing;

    // Add new name if not exists
    if (!existing) {
      const res = await fetch("https://baalpathiattendace.onrender.com/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      newEntry = await res.json();
      setNames([...names, newEntry]);
    }

    const record = { ...newEntry, time, date };
    await fetch("https://baalpathiattendace.onrender.com/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });

    onAdd(record);
    setName("");
    setTime("");
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        {isSunday ? "Sunday Attendance Register" : "Mark Attendance"}
      </h2>

      {isSunday ? (
        <div className="flex flex-col gap-2">
          {names.sort((a, b) => a.name.localeCompare(b.name)).map(n => (
            <div key={n.id} className="flex items-center gap-2">
              <span className="flex-1">{n.name}</span>
              <input
                type="time"
                value={sundayTimes[n.id] || ""}
                onChange={(e) =>
                  setSundayTimes(prev => ({ ...prev, [n.id]: e.target.value }))
                }
                className="p-1 border rounded w-24"
              />
              <button
                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                onClick={() => {
                  const timeValue = sundayTimes[n.id];
                  if (!timeValue) return;
                  const record = { ...n, time: timeValue, date };
                  fetch("https://baalpathiattendace.onrender.com/attendance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(record)
                  });
                  onAdd(record);
                  setSundayTimes(prev => ({ ...prev, [n.id]: "" }));
                }}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            list="name-options"
            className="p-2 border rounded-lg"
          />
          <datalist id="name-options">
            {names.map(n => (
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
            max={localDate} // no future dates
            className="p-2 border rounded-lg"
          />

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Add Attendance
          </button>
        </div>
      )}
    </div>
  );
}
