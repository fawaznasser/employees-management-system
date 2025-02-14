import { useLoaderData, Form } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";

// Define Timesheet Type
interface Timesheet {
  id: number;
  employee_id: number;
  start_time: string;
  end_time: string;
  summary: string;
  full_name: string;
}

// Fetch Single Timesheet Data
export async function loader({ params }: { params: { id: string } }) {
  const db = await getDB();
  const timesheet = await db.get(
    "SELECT timesheets.*, employees.full_name FROM timesheets JOIN employees ON timesheets.employee_id = employees.id WHERE timesheets.id = ?",
    [params.id]
  );
  if (!timesheet) {
    throw new Response("Timesheet Not Found", { status: 404 });
  }
  return { timesheet };
}

export default function TimesheetPage() {
  const { timesheet } = useLoaderData() as { timesheet: Timesheet };
  const [startTime, setStartTime] = useState(timesheet.start_time);
  const [endTime, setEndTime] = useState(timesheet.end_time);
  const [summary, setSummary] = useState(timesheet.summary);
  const [error, setError] = useState("");

  // Validation: Ensure start time is before end time
  const validateTimes = () => {
    if (new Date(startTime) >= new Date(endTime)) {
      setError("⚠️ Start time must be before the end time.");
      return false;
    }
    setError("");
    return true;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">
        ⏳ Edit Timesheet #{timesheet.id}
      </h1>

      <div className="bg-gray-900 text-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
        <Form method="post" className="space-y-4">
          <div>
            <label className="block text-gray-300 font-semibold">👤 Employee</label>
            <input
              type="text"
              value={timesheet.full_name}
              disabled
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
            />
          </div>

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

          <div>
            <label htmlFor="summary" className="block text-gray-300 font-semibold">📝 Work Summary</label>
            <textarea
              name="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={!!error}
            className={`w-full px-5 py-3 rounded-lg shadow-lg transition ${error ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"}`}
          >
            ✅ Update Timesheet
          </button>
        </Form>
      </div>

      <div className="mt-8 flex space-x-4">
        <a href="/timesheets" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition">
          📋 View Timesheets
        </a>
        <a href={`/employees/${timesheet.employee_id}`} className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-600 transition">
          👤 View Employee
        </a>
      </div>
    </div>
  );
}
