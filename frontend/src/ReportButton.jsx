import { exportToExcel } from "./exportExcel";
import React from "react";
export default function ReportButton({ records }) {
    return (
        <button
            onClick={() => exportToExcel(records)}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
        >
            See Report
        </button>
    );
}
