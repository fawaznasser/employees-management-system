import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { getDB } from "~/db/getDB";

// Import Schedule-X Calendar Components
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";

import "@schedule-x/theme-default/dist/index.css";

import CustomTimeGridEvent from "~/components/CustomTimeGridEvent";
import CustomDateGridEvent from "~/components/CustomDateGridEvent";

// Load timesheets from the database
export async function loader() {
  try {
    const db = await getDB();
    const timesheetsAndEmployees = await db.all(
      "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
    );
    return { timesheetsAndEmployees };
  } catch (error) {
    console.error("❌ Failed to load timesheets:", error);
    return { timesheetsAndEmployees: [] };
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData();
  const [view, setView] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [sortBy, setSortBy] = useState("start_time");

  const eventsService = useState(() => createEventsServicePlugin())[0];

  // Format events for Schedule-X calendar
  const events = timesheetsAndEmployees.map((timesheet: any) => ({
    id: timesheet.id.toString(),
    title: timesheet.full_name,
    start: formatDate(timesheet.start_time),
    end: formatDate(timesheet.end_time),
  }));

  // Initialize Calendar
  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: events,
    plugins: [eventsService],
  });

  useEffect(() => {
    eventsService.getAll();
  }, []);

  const filteredTimesheets = timesheetsAndEmployees
    .filter(
      (timesheet: any) =>
        timesheet.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterEmployee ? timesheet.full_name === filterEmployee : true) 
    )
    .sort((a: any, b: any) => (new Date(a[sortBy]) > new Date(b[sortBy]) ? 1 : -1));

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">
        ⏳ Employee Timesheets
      </h1>

      {/* Search, Filtering & Sorting */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search Employee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600"
        />

        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600"
        >
          <option value="">Filter by Employee</option>
          {Array.from(new Set(timesheetsAndEmployees.map((t: any) => t.full_name))).map(
            (name) => (
              <option key={String(name)} value={String(name)}>
                {String(name)}
              </option>
            )
          )}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600"
        >
          <option value="start_time">Sort by Start Time</option>
          <option value="end_time">Sort by End Time</option>
        </select>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-5 py-3 rounded-lg shadow-lg transition ${
            view === "table"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setView("table")}
        >
          📋 Table View
        </button>
        <button
          className={`px-5 py-3 rounded-lg shadow-lg transition ${
            view === "calendar"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setView("calendar")}
        >
          📅 Calendar View
        </button>
      </div>

      {/* Table View */}
      {view === "table" ? (
        <div className="overflow-x-auto bg-gray-900 text-white shadow-lg rounded-xl p-6 w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-yellow-300">
                <th className="p-3 text-left">👤 Employee</th>
                <th className="p-3 text-left">🕒 Start Time</th>
                <th className="p-3 text-left">🕛 End Time</th>
                <th className="p-3 text-left">🔗 Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.map((timesheet: any) => (
                <tr key={timesheet.id} className="border-b border-gray-700 hover:bg-gray-800 transition">
                  <td className="p-3">{timesheet.full_name}</td>
                  <td className="p-3">{formatDate(timesheet.start_time)}</td>
                  <td className="p-3">{formatDate(timesheet.end_time)}</td>
                  <td className="p-3">
                    <a
                      href={`/timesheets/${timesheet.id}`}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-600 transition"
                    >
                      🔍 View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Calendar View
        <div className="bg-gray-900 text-white shadow-lg rounded-xl p-6 w-full">
          <div className="sx-react-calendar-wrapper">
            <ScheduleXCalendar
              calendarApp={calendar}
              customComponents={{
                timeGridEvent: CustomTimeGridEvent,
                dateGridEvent: CustomDateGridEvent,
              }}
            />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="mt-8 flex justify-center space-x-4">
        <a href="/timesheets/new" className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition">
          ➕ New Timesheet
        </a>
        <a href="/employees" className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-600 transition">
          👥 View Employees
        </a>
      </div>
    </div>
  );
}
