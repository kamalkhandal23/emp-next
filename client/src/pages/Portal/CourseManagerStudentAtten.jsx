import React, { useState, useEffect } from "react";
import { apiClient } from "../../utils/api";

export default function CourseAttendance() {
  const courseId = "6911af65cf8ecf46cb76373a"; // Your course ID
  const token = localStorage.getItem("authToken");

  const [viewType, setViewType] = useState("student"); // "student" | "date"
  const [students, setStudents] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch attendance of all students
  const fetchByStudent = async () => {
    try {
      const res = await apiClient.getStudentAttendance(courseId, token);
      setStudents(res.data);
      console.log("Students:", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch attendance by date
  const fetchByDate = async () => {
    if (!selectedDate) return;
    try {
      const res = await apiClient.getStudentAttendanceByDate(
        courseId,
        selectedDate,
        token
      );
      setDates(res.data);
      console.log("Date-wise attendance:", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch detailed attendance of a single student
  const fetchStudentDetails = async (studentId) => {
    try {
      const res = await apiClient.getStudentAttendanceByName(
        courseId,
        studentId,
        token
      );
      setStudentAttendance(res.data.attendance || []);
      setSelectedStudent(studentId);
      console.log("Student details:", res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load students when viewType is "student"
  useEffect(() => {
    if (viewType === "student") fetchByStudent();
    setSelectedStudent(null);
  }, [viewType]);

  // Load date-wise attendance when viewType is "date" and date is selected
  useEffect(() => {
    if (viewType === "date" && selectedDate) fetchByDate();
  }, [selectedDate, viewType]);

  return (
    <div className="attendance-container">
      <h1>Attendance</h1>

      {/* View Selector */}
      <div className="selector-row">
        <button
          className={viewType === "student" ? "active" : ""}
          onClick={() => setViewType("student")}
        >
          By Students
        </button>
        <button
          className={viewType === "date" ? "active" : ""}
          onClick={() => setViewType("date")}
        >
          By Date
        </button>
      </div>

      {/* Date Picker */}
      {viewType === "date" && (
        <div>
          <input
            type="date"
            className="date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      )}

      {/* Student View */}
      {viewType === "student" && !selectedStudent && (
        <div className="card-grid">
          {students.map((stu) => (
            <div
              key={stu.studentId}
              className="card"
              onClick={() => fetchStudentDetails(stu.studentId)}
            >
              <h3>{stu.studentName}</h3>
              <p>Total Present: {stu.totalPresent}</p>
              <p>Total Absent: {stu.totalAbsent}</p>
            </div>
          ))}
        </div>
      )}

      {/* Selected Student Details */}
      {selectedStudent && (
        <div className="details-section">
          <h2>Attendance Details</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentAttendance.map((att, idx) => (
                <tr key={idx}>
                  <td>{new Date(att.date).toLocaleDateString()}</td>
                  <td>{att.className}</td>
                  <td
                    className={att.status === "Present" ? "present" : "absent"}
                  >
                    {att.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Date-wise View */}
      {viewType === "date" && (
  <div className="card-grid">
    {dates.map((d, idx) => {
      const att = d.attendance[0]; // first (and only) record for that date
      const status = att?.status;

      return (
        <div className="card" key={idx}>
          <h3>
            {att?.date ? new Date(att.date).toDateString() : "No Date"}
          </h3>

          <p>Present: {status === "Present" ? 1 : 0}</p>
          <p>Absent: {status === "Absent" ? 1 : 0}</p>
        </div>
      );
    })}
  </div>
)}

      {/* CSS */}
      <style>{`
        .attendance-container {
          padding: 20px 40px;
          font-family: 'Inter', sans-serif;
        }

        .selector-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .selector-row button {
          padding: 10px 20px;
          background: #2d2f39;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .selector-row button.active {
          background: #3b82f6;
        }

        .date-input {
          margin: 15px 0;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }

        .card {
          background: #1f2129;
          padding: 20px;
          border-radius: 12px;
          color: white;
          cursor: pointer;
        }

        .details-section {
          margin-top: 25px;
        }

        table {
          width: 100%;
          margin-top: 10px;
          border-collapse: collapse;
        }

        th, td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }

        .present { color: #22c55e; font-weight: bold; }
        .absent { color: #ef4444; font-weight: bold; }
      `}</style>
    </div>
  );
}
