import { useLoaderData } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";

// Define Employee Type
interface Employee {
  id: number;
  full_name: string;
  department: string;
  job_title: string;
  start_date: string;
}

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name, department, job_title, start_date FROM employees;");
  return { employees };
}

export default function EmployeesPage() {
  const { employees } = useLoaderData() as { employees: Employee[] };

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Employee | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

  const filteredEmployees = employees
    .filter((employee) =>
      employee.full_name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDepartment ? employee.department === filterDepartment : true)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      const fieldA = a[sortField] || "";
      const fieldB = b[sortField] || "";
      return sortOrder === "asc"
        ? String(fieldA).localeCompare(String(fieldB))
        : String(fieldB).localeCompare(String(fieldA));
    });

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * employeesPerPage, currentPage * employeesPerPage);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center">🌟 Employee Directory</h1>

      {/* 🔍 Search & Filtering Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="🔍 Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 bg-gray-800 text-white rounded border border-gray-600 focus:ring-2 focus:ring-yellow-500 w-full sm:w-1/3"
        />

        {/* Filter by Department */}
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="p-3 bg-gray-800 text-white rounded border border-gray-600 ml-4"
        >
          <option value="">All Departments</option>
          {[...new Set(employees.map((e) => e.department))].map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto bg-gray-900 shadow-lg rounded-xl p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-yellow-300">
              <th className="p-3 text-left cursor-pointer" onClick={() => setSortField("full_name")}>
                👤 Full Name {sortField === "full_name" ? (sortOrder === "asc" ? "⬆" : "⬇") : ""}
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => setSortField("department")}>
                📂 Department {sortField === "department" ? (sortOrder === "asc" ? "⬆" : "⬇") : ""}
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => setSortField("job_title")}>
                💼 Job Title {sortField === "job_title" ? (sortOrder === "asc" ? "⬆" : "⬇") : ""}
              </th>
              <th className="p-3 text-left">📅 Start Date</th>
              <th className="p-3 text-left">🔗 Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((employee) => (
              <tr key={employee.id} className="border-b border-gray-700 hover:bg-gray-800 transition">
                <td className="p-3">{employee.full_name}</td>
                <td className="p-3">{employee.department || "N/A"}</td>
                <td className="p-3">{employee.job_title || "N/A"}</td>
                <td className="p-3">{employee.start_date || "N/A"}</td>
                <td className="p-3">
                  <a 
                    href={`/employees/${employee.id}`}  
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-600 transition">
                    🔍 View Profile
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg mx-2 disabled:opacity-50"
        >
           Prev
        </button>
        <span className="px-4 py-2 text-yellow-400">{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg mx-2 disabled:opacity-50"
        >
          Next 
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-wrap justify-center space-x-4">
        <a href="/employees/new" 
          className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition">
          ➕ Add Employee
        </a>
        <a href="/timesheets/" 
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition">
          ⏳ View Timesheets
        </a>
      </div>
    </div>
  );
}
