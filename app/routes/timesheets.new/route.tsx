import { useLoaderData, Form, redirect, type ActionFunction } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";

// 🔹 Load Employees for Dropdown
export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { employees };
}

// 🔹 Add `action` Function to Handle Form Submission
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id") as string;
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const summary = formData.get("summary") as string;

  if (!employee_id || !start_time || !end_time || !summary) {
    return { error: "⚠️ All fields are required." };
  }

  if (new Date(start_time) >= new Date(end_time)) {
    return { error: "⚠️ Start time must be before end time." };
  }

  const db = await getDB();
  await db.run(
    "INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)",
    [employee_id, start_time, end_time, summary]
  );

  return redirect("/timesheets");
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  // 🔹 Validate Start Time is Before End Time
  const validateTimes = () => {
    if (!startTime || !endTime) return;
    if (new Date(startTime) >= new Date(endTime)) {
      setError("⚠️ Start time must be before the end time.");
    } else {
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">➕ Create New Timesheet</h1>

      <div className="bg-gray-900 text-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
        <Form method="post" className="space-y-4">
          {/* Employee Select Dropdown */}
          <div>
            <label htmlFor="employee_id" className="block text-gray-300 font-semibold">👤 Select Employee</label>
            <select
              name="employee_id"
              required
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
            >
              <option value="">-- Select an Employee --</option>
              {employees.map((employee: any) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time Input */}
          <div>
            <label htmlFor="start_time" className="block text-gray-300 font-semibold">🕒 Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              onBlur={validateTimes}
              required
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
            />
          </div>

          {/* End Time Input */}
          <div>
            <label htmlFor="end_time" className="block text-gray-300 font-semibold">🕛 End Time</label>
            <input
              type="datetime-local"
              name="end_time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onBlur={validateTimes}
              required
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
            />
          </div>

          {/* Static Error Display */}
          {error && <p className="text-red-500 font-semibold">{error}</p>}

          {/* Work Summary */}
          <div>
            <label htmlFor="summary" className="block text-gray-300 font-semibold">📝 Work Summary</label>
            <textarea
              name="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
            />
          </div>

          {/* Submit Button (Disabled if Error Exists) */}
          <button
            type="submit"
            disabled={!!error}
            className={`w-full px-5 py-3 rounded-lg shadow-lg transition ${error ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"}`}
          >
            ✅ Create Timesheet
          </button>
        </Form>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex space-x-4">
        <a href="/timesheets" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition">
          📋 View Timesheets
        </a>
        <a href="/employees" className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-600 transition">
          👥 View Employees
        </a>
      </div>
    </div>
  );
}
