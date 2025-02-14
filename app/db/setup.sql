-- Drop existing tables before recreating them
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS timesheets;
DROP TABLE IF EXISTS employee_documents;

-- Create employees table
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NULL UNIQUE, 
    job_title TEXT NULL,
    department TEXT NULL,
    salary REAL NULL,
    phone TEXT NULL,          
    start_date TEXT NULL,  
    end_date TEXT NULL,
    document_path TEXT NULL,   
    dob TEXT NULL              
);

-- Create timesheets table with Summary Field
CREATE TABLE timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,  -- Format: YYYY-MM-DD
    end_time TEXT NOT NULL,    -- Format: YYYY-MM-DD
    summary TEXT NULL,         
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create employee documents table
CREATE TABLE employee_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Insert Employees
INSERT INTO employees (id, full_name, email, job_title, department, salary, phone, start_date, end_date, dob) VALUES
(1, 'John Doe', 'john.doe@example.com', 'Software Engineer', 'IT', 75000, '123-456-7890', '2022-06-15', NULL, '1990-05-12'),
(2, 'Jane Smith', 'jane.smith@example.com', 'HR Manager', 'HR', 68000, '987-654-3210', '2021-08-01', NULL, '1988-09-23'),
(3, 'Alice Johnson', 'alice.johnson@example.com', 'Marketing Specialist', 'Marketing', 62000, '555-666-7777', '2020-05-20', '2023-01-01', '1995-07-19'),
(4, 'Bob Williams', 'bob.williams@example.com', 'Accountant', 'Finance', 72000, '111-222-3333', '2019-03-10', NULL, '1985-11-30'),
(5, 'Emily Brown', 'emily.brown@example.com', 'Project Manager', 'Operations', 85000, '444-555-6666', '2018-11-30', NULL, '1992-02-14');

-- Insert Timesheets with Summary Field
INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES
(1, '2024-02-10', '2024-02-10', 'Worked on frontend development'),
(2, '2024-02-11', '2024-02-11', 'Reviewed HR policies'),
(3, '2024-02-12', '2024-02-12', 'Created marketing campaign'),
(4, '2024-02-13', '2024-02-13', 'Processed financial reports'),
(5, '2024-02-14', '2024-02-14', 'Managed project tasks and team meetings');

-- Ensure timesheet dates follow YYYY-MM-DD format
UPDATE timesheets 
SET start_time = strftime('%Y-%m-%d', start_time),
    end_time = strftime('%Y-%m-%d', end_time);

-- Ensure all employee document file paths are correctly prefixed with "uploads/"
UPDATE employee_documents 
SET file_path = 'project/ems-challenge/app/uploads/' || file_path
WHERE file_path NOT LIKE 'uploads/%';

-- Verify data
SELECT * FROM employees;
SELECT * FROM timesheets;
SELECT * FROM employee_documents;
