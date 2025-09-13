import React, { useEffect, useState } from "react";
import AttendanceForm from "./AttendanceForm";
import ReportButton from "./ReportButton";

export default function App() {
    const [records, setRecords] = useState([]);
    const [showToday, setShowToday] = useState(false);
    const [showTable, setShowTable] = useState(false);

    const addRecord = (record) => {
        setRecords([...records, record]);
    };

    const today = new Date().toISOString().split("T")[0];
    const filtered = showToday
        ? records.filter(r => r.date === today)
        : records;
    useEffect(() => {
        fetch("http://localhost:4000/attendance")
            .then(res => res.json())
            .then(setRecords);
    }, []);
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold mb-6">Attendance Tracker</h1>

            <AttendanceForm onAdd={addRecord} />

            {records.length > 0 && (
                <div className="mt-6 flex gap-4">
                    <button
                        onClick={() => setShowToday(!showToday)}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                        {showToday ? "Show All" : "Show Today"}
                    </button>

                    <button
                        onClick={() => setShowTable(!showTable)}
                        className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                    >
                        {showTable ? "Hide Table" : "View Table"}
                    </button>

                    <ReportButton records={records} />
                </div>
            )}

            {showTable && (
                <div className="mt-6 w-full max-w-3xl bg-white shadow rounded-lg overflow-x-auto">
                    <table className="table-auto w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-4 py-2">Name</th>
                                {[
                                    ...new Set(records.map(r => r.date))
                                ].sort().map(date => (
                                    <th key={date} className="border px-4 py-2">{date}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...new Set(records.map(r => r.name))]
                                .sort((a, b) => a.localeCompare(b))
                                .map(name => (
                                    <tr key={name}>
                                        <td className="border px-4 py-2 font-medium">{name}</td>
                                        {[...new Set(records.map(r => r.date))]
                                            .sort()
                                            .map(date => {
                                                const rec = records.find(r => r.name === name && r.date === date);
                                                return (
                                                    <td key={date} className="border px-4 py-2 text-center">
                                                        {rec ? rec.time : "-"}
                                                    </td>
                                                );
                                            })}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!showTable && filtered.length > 0 && (
                <ul className="mt-6 w-full max-w-md bg-white shadow rounded-lg p-4">
                    {filtered.map((r, i) => (
                        <li key={i} className="flex justify-between border-b py-2">
                            <span>{r.name}</span>
                            <span>{r.time}</span>
                            <span>{r.date}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
