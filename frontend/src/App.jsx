import React, { useEffect, useState } from "react";
import AttendanceForm from "./AttendanceForm";
import ReportButton from "./ReportButton";
import AddNameButton from "./AddNameButton";

export default function App() {
    const [records, setRecords] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date()); // current month

    useEffect(() => {
        fetch("https://baalpathiattendace.onrender.com/attendance")
            .then(res => res.json())
            .then(setRecords);
    }, []);
    const [names, setNames] = useState([]);

    useEffect(() => {
        fetch("https://baalpathiattendace.onrender.com/names")
            .then(res => res.json())
            .then(setNames);
    }, []);
    // Filter records by current month
    const monthRecords = records.filter(r => {
        const rDate = new Date(r.date);
        return (
            rDate.getMonth() === currentMonth.getMonth() &&
            rDate.getFullYear() === currentMonth.getFullYear()
        );
    });

    // Get unique dates in month
    const monthDates = [...new Set(monthRecords.map(r => r.date))].sort();

    // Unique names in month
    // const names = [...new Set(monthRecords.map(r => r.name))].sort();

    const prevMonth = () => {
        const d = new Date(currentMonth);
        d.setMonth(d.getMonth() - 1);
        setCurrentMonth(d);
    };

    const nextMonth = () => {
        const d = new Date(currentMonth);
        d.setMonth(d.getMonth() + 1);
        setCurrentMonth(d);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold mb-6">Attendance Tracker</h1>
            <AddNameButton onAddName={(newName) => setNames([...names, newName])} />
            <AttendanceForm
                names={names}
                setNames={setNames}
                onAdd={record => setRecords([...records, record])}
            />

            {records.length > 0 && (
                <div className="mt-6 flex gap-4">
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
                <div className="mt-6 flex flex-col items-center">
                    <div className="flex gap-4 mb-4">
                        <button onClick={prevMonth} className="bg-gray-300 px-3 py-1 rounded">{"<"}</button>
                        <span className="font-medium">
                            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                        </span>
                        <button onClick={nextMonth} className="bg-gray-300 px-3 py-1 rounded">{">"}</button>
                    </div>

                    <div className="w-full max-w-3xl bg-white shadow rounded-lg overflow-x-auto">
                        <table className="table-auto w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border px-4 py-2">Name</th>
                                    {monthDates.map(date => (
                                        <th key={date} className="border px-4 py-2">{date}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {names.map(nameObj => (
                                    <tr key={nameObj.id}>
                                        <td className="border px-4 py-2 font-medium">{nameObj.name}</td>
                                        {monthDates.map(date => {
                                            const rec = monthRecords.find(
                                                r => r.name === nameObj.name && r.date === date
                                            );
                                            return (
                                                <td key={date} className="border px-4 py-2 text-center">
                                                    {rec?.time || "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
