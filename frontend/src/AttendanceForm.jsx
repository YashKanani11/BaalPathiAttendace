import React, { useState } from "react";

export default function AttendanceForm({ names, setNames, onAdd, token, apiBase }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [search, setSearch] = useState("");

  // Get local Kolkata date
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
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
    let existing = names.find((n) => n.name.toLowerCase() === name.toLowerCase());
    let newEntry = existing;

    // Add new name if not exists
    if (!existing) {
      const res = await fetch(`${apiBase}/names`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to add name");
        return;
      }

      newEntry = await res.json();
      setNames((prev) => [...prev, newEntry]);
    }

    const record = { nameId: newEntry.id || newEntry._id, name: newEntry.name, time, date };
    const rres = await fetch(`${apiBase}/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(record),
    });

    if (!rres.ok) {
      const err = await rres.json().catch(() => ({}));
      alert(err.error || "Failed to save attendance");
      return;
    }

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
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded-lg mb-2"
          />

          {names
            .filter((n) => n.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((n) => (
              <div key={n.id || n._id} className="flex items-center gap-2">
                <span className="flex-1">{n.name}</span>
                <input
                  type="time"
                  value={sundayTimes[n.id] || sundayTimes[n._id] || ""}
                  onChange={(e) =>
                    setSundayTimes((prev) => ({ ...prev, [n.id || n._id]: e.target.value }))
                  }
                  className="p-1 border rounded w-24"
                />
                {/* Individual Add button */}
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  onClick={async () => {
                    const timeValue = sundayTimes[n.id] || sundayTimes[n._id];
                    if (!timeValue) return;
                    const record = {
                      nameId: n.id || n._id,
                      name: n.name,
                      time: timeValue,
                      date,
                    };
                    const res = await fetch(`${apiBase}/attendance`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(record),
                    });
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      alert(err.error || "Failed to save attendance");
                      return;
                    }
                    onAdd(record); // push single record
                    setSundayTimes((prev) => ({ ...prev, [n.id || n._id]: "" }));
                  }}
                >
                  Add
                </button>
              </div>
            ))}

          {/* Add All button */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
            onClick={async () => {
              const toSave = names
                .filter((n) => (sundayTimes[n.id] || sundayTimes[n._id]))
                .map((n) => ({
                  nameId: n.id || n._id,
                  name: n.name,
                  time: sundayTimes[n.id] || sundayTimes[n._id],
                  date,
                }));

              for (const record of toSave) {
                const res = await fetch(`${apiBase}/attendance`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(record),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  alert(err.error || "Failed to save one of the records");
                } else {
                  onAdd(record); // push each saved record
                }
              }

              setSundayTimes({}); // clear all inputs
            }}
          >
            Add All
          </button>
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
            {names.map((n) => (
              <option key={n.id || n._id} value={n.name} />
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
