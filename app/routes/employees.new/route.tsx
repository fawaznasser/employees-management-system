import { Form, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";
import fs from "fs";
import path from "path";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name") as string;
  const department = formData.get("department") as string;
  const job_title = formData.get("job_title") as string;
  const start_date = formData.get("start_date") as string;
  const dob = formData.get("dob") as string;
  const salary = parseFloat(formData.get("salary") as string);
  const phone = formData.get("phone") as string;

  const photo = formData.get("photo") as File | null;
  const documents = formData.getAll("documents") as File[];

  let photoPath = null;
  let documentPaths: string[] = [];

  const MINIMUM_WAGE = 20000;
  const MAXIMUM_WAGE = 150000;

  // Ensure the employee is at least 18 years old
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 18) {
    throw new Error("Employee must be at least 18 years old.");
  }

  // Ensure salary is within the allowed range
  if (salary < MINIMUM_WAGE || salary > MAXIMUM_WAGE) {
    throw new Error(`Salary must be between $${MINIMUM_WAGE} and $${MAXIMUM_WAGE}.`);
  }

  // Ensure at least one document is uploaded
  if (documents.length === 0) {
    throw new Error("At least one document (CV, ID, etc.) is required.");
  }

  const uploadDir = path.join(process.cwd(), "uploads");

  // Ensure the uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Save Photo
  if (photo && photo.size > 0) {
    const photoName = `${Date.now()}_${photo.name}`;
    const photoFilePath = path.join("uploads", photoName);
    fs.writeFileSync(photoFilePath, Buffer.from(await photo.arrayBuffer()));
    photoPath = photoFilePath;
  }

  // Save Documents
  for (const file of documents) {
    if (file.size > 0) {
      const docName = `${Date.now()}_${file.name}`;
      const docFilePath = path.join("uploads", docName);
      fs.writeFileSync(docFilePath, Buffer.from(await file.arrayBuffer()));
      documentPaths.push(docFilePath);
    }
  }

  // Insert Employee Data
  const db = await getDB();
  const result = await db.run(
    `INSERT INTO employees (full_name, department, job_title, start_date, dob, salary, phone, document_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [full_name, department, job_title, start_date, dob, salary, phone, photoPath]
  );

  const employeeId = result.lastID;

  // Insert Document Paths into `employee_documents` table
  for (const docPath of documentPaths) {
    await db.run(
      `INSERT INTO employee_documents (employee_id, file_path) VALUES (?, ?)`,
      [employeeId, docPath]
    );
  }

  return redirect("/employees");
};

export default function NewEmployeePage() {
  const [ageError, setAgeError] = useState("");
  const [salaryError, setSalaryError] = useState("");

  const MINIMUM_WAGE = 20000;
  const MAXIMUM_WAGE = 150000;

  const validateAge = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = new Date(e.target.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    setAgeError(age < 18 ? "⚠️ Employee must be at least 18 years old." : "");
  };

  const validateSalary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const salary = parseFloat(e.target.value);
    setSalaryError(
      salary < MINIMUM_WAGE || salary > MAXIMUM_WAGE
        ? `⚠️ Salary must be between $${MINIMUM_WAGE} and $${MAXIMUM_WAGE}.`
        : ""
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-6">➕ Add New Employee</h1>

      {/* Form Container */}
      <div className="bg-gray-900 p-6 shadow-lg rounded-xl w-full max-w-md">
        <Form method="post" encType="multipart/form-data" className="space-y-4">
          <div>
            <label className="block text-gray-300 font-medium">Full Name</label>
            <input type="text" name="full_name" required className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600"/>
          </div>

          <div>
            <label className="block text-gray-300 font-medium">Department</label>
            <input type="text" name="department" required className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600"/>
          </div>

          <div>
            <label className="block text-gray-300 font-medium">Job Title</label>
            <input type="text" name="job_title" required className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600"/>
          </div>

          <div>
            <label className="block text-gray-300 font-medium">Phone Number</label>
            <input type="text" name="phone" required className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600"/>
          </div>

          <div>
            <label className="block text-gray-300 font-medium">Date of Birth</label>
            <input type="date" name="dob" required className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600" onChange={validateAge} />
            {ageError && <p className="text-sm text-red-400 mt-1">{ageError}</p>}
          </div>

          <div>
            <label className="block text-gray-300 font-medium">Salary</label>
            <input type="number" name="salary" required className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600" onChange={validateSalary} />
            {salaryError && <p className="text-sm text-red-400 mt-1">{salaryError}</p>}
          </div>

          <div>
            <label className="block text-gray-300 font-medium">Upload Profile Picture</label>
            <input type="file" name="photo" accept=".jpg,.png" className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"/>
          </div>

          <div>
            <label className="block text-gray-300 font-medium">Upload Documents (CV, ID, etc.)</label>
            <input type="file" name="documents" accept=".pdf,.doc,.docx,.jpg,.png" multiple className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"/>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex space-x-4">
            <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg shadow-lg hover:bg-green-600 transition">
              ✅ Create Employee
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
