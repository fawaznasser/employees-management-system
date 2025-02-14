import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";

// Define TypeScript Interfaces
interface Employee {
  id: number;
  full_name: string;
  department: string;
  job_title: string;
  phone: string;
  dob: string;
  salary: number;
  start_date: string;
  document_path: string | null;
}

interface Document {
  file_path: string;
}

export async function loader({ params }: LoaderFunctionArgs) {
  console.log("🔍 Received params object:", params);

  if (!params.employeeId) {  
    console.error("❌ Missing Employee ID in URL");
    throw new Response("Missing Employee ID", { status: 400 });
  }

  const employeeId = parseInt(params.employeeId, 10);
  if (isNaN(employeeId)) {
    console.error("❌ Invalid Employee ID:", params.employeeId);
    throw new Response("Invalid Employee ID", { status: 400 });
  }

  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [employeeId]);
  console.log("✅ Employee Data:", employee);

  const documents = await db.all("SELECT file_path FROM employee_documents WHERE employee_id = ?", [employeeId]);
  console.log("✅ Employee Documents:", documents);

  return { employee, documents };
}

export default function EmployeePage() {
  const { employee, documents } = useLoaderData() as { employee: Employee | null; documents: Document[] };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <h1 className="text-3xl text-red-500">❌ Employee Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-6">👤 {employee.full_name}</h1>

      <div className="bg-gray-900 p-6 shadow-lg rounded-xl w-full max-w-lg">
        {employee.document_path && (
          <div className="mb-4 flex justify-center">
            <img src={`/${employee.document_path}`} alt="Profile Picture" className="w-32 h-32 rounded-full shadow-lg" />
          </div>
        )}
        
        <p className="text-gray-300"><strong>📂 Department:</strong> {employee.department || "N/A"}</p>
        <p className="text-gray-300"><strong>💼 Job Title:</strong> {employee.job_title || "N/A"}</p>
        <p className="text-gray-300"><strong>📞 Phone:</strong> {employee.phone || "N/A"}</p>
        <p className="text-gray-300"><strong>📅 DOB:</strong> {employee.dob || "N/A"}</p>
        <p className="text-gray-300"><strong>💰 Salary:</strong> ${employee.salary.toLocaleString()}</p>
        <p className="text-gray-300"><strong>📅 Start Date:</strong> {employee.start_date || "N/A"}</p>

        {documents.length > 0 && (
          <div className="mt-4">
            <h2 className="text-yellow-400 font-bold">📑 Documents</h2>
            <ul className="list-disc pl-5">
              {documents.map((doc: Document, index: number) => (
                <li key={index}>
                  <a href={`/${doc.file_path}`} className="text-blue-400 underline" download>
                    📂 {doc.file_path.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8 flex space-x-4">
        <a href="/employees" className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition">
          🔙 Back to Employees
        </a>
        <a href="/timesheets" className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-600 transition">
          ⏳ View Timesheets
        </a>
      </div>
    </div>
  );
}
