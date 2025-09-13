import React, { useState } from "react";

export default function AddNameButton({ onAddName }) {
    const [showInput, setShowInput] = useState(false);
    const [newName, setNewName] = useState("");

    const handleSave = async () => {
        if (!newName.trim()) return;

        const res = await fetch("https://baalpathiattendace.onrender.com/names", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName })
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.error);
            return;
        }

        const savedName = await res.json();
        onAddName(savedName);
        setNewName("");
        setShowInput(false);
    };

    return (
        <div className="flex flex-col items-start gap-2">
            {!showInput ? (
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    onClick={() => setShowInput(true)}
                >
                    Add New Name
                </button>
            ) : (
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                        className="p-2 border rounded"
                    />
                    <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                    <button
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                        onClick={() => { setShowInput(false); setNewName(""); }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
