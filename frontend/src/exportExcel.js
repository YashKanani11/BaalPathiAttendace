import * as XLSX from "xlsx";

export function exportToExcel(records, filename = "attendance.xlsx") {
  // Group by name + date
  const grouped = {};
  records.forEach((r) => {
    if (!grouped[r.name]) grouped[r.name] = {};
    grouped[r.name][r.date] = r.time;
  });

  // Collect and sort unique dates
  const allDates = [...new Set(records.map((r) => r.date))].sort();

  // Sort names alphabetically
  const sortedNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  // Build rows
  const rows = sortedNames.map((name) => {
    const row = { Name: name };
    allDates.forEach((d) => {
      row[d] = grouped[name][d] || "";
    });
    return row;
  });

  // Generate sheet
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, filename);
}
