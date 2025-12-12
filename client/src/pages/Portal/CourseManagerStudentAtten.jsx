import React, { useState, useEffect } from "react";
import { apiClient } from "../../utils/api";

export default function CourseAttendance() {
  const token = localStorage.getItem("authToken");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [viewType, setViewType] = useState("student");
  const [students, setStudents] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // ================================
  // PDF Download Function
  // ================================
  const downloadPDF = async (elementId, fileName) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return console.error("PDF element not found:", elementId);

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName + ".pdf");

    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  // ================================
  // Logout
  // ================================
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  // ================================
  // Fetch Data
  // ================================
  const fetchCourses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")).id;
      const res = await apiClient.getAssignedCourses(user, token);
      setCourses(res.data || []);
      if (res.data?.length > 0) setSelectedCourse(res.data[0].courseId);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchByStudent = async () => {
    if (!selectedCourse) return;
    try {
      const res = await apiClient.getStudentAttendance(selectedCourse, token);
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchByDate = async () => {
    if (!selectedCourse || !selectedDate) return;
    try {
      const res = await apiClient.getStudentAttendanceByDate(
        selectedCourse,
        selectedDate,
        token
      );
      setDates(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    if (!selectedCourse) return;
    try {
      const res = await apiClient.getStudentAttendanceByName(
        selectedCourse,
        studentId,
        token
      );
      setStudentAttendance(res.data?.attendance || []);
      setSelectedStudent(studentId);
    } catch (err) {
      console.error(err);
    }
  };

  // ================================
  // USE EFFECTS
  // ================================
  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (viewType === "student") fetchByStudent();
    setSelectedStudent(null);
  }, [viewType, selectedCourse]);

  useEffect(() => {
    if (viewType === "date" && selectedDate) fetchByDate();
  }, [selectedDate, viewType, selectedCourse]);

  return (
    <div className="portal-layout">
      {/* HEADER BAR */}
      <header className="portal-header">
        <div className="container header-inner">
          <div className="brand">
            <h1 className="brand-title">Course Manager Dashboard</h1>
            <p className="brand-sub">Course Manager Panel</p>
          </div>

          <div className="header-actions">
            <button onClick={handleLogout} className="btn-secondary logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SECTION */}
      <main className="attendance-container">
        <div className="container">
          <div className="page-header">
            <h2 className="page-title">Attendance</h2>

            <div className="controls">
              <select
                className="course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>

              <div className="selector-row">
                <button
                  className={`selector-btn ${viewType === "student" ? "active" : ""}`}
                  onClick={() => setViewType("student")}
                >
                  By Students
                </button>

                <button
                  className={`selector-btn ${viewType === "date" ? "active" : ""}`}
                  onClick={() => setViewType("date")}
                >
                  By Date
                </button>
              </div>

              {viewType === "date" && (
                <input
                  type="date"
                  className="date-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* ======================================
              STUDENT LIST VIEW
          ====================================== */}
          {viewType === "student" && !selectedStudent && (
            <section id="studentTableSection" className="table-section">
              <h3 className="section-title">Students Attendance Overview</h3>

              <div className="table-wrapper">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th className="col-numeric">Present</th>
                      <th className="col-action">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={4} className="empty-row">No students found</td>
                      </tr>
                    )}

                    {students.map((stu) => (
                      <tr key={stu.studentId}>
                        <td>{stu.studentName}</td>
                        <td>{stu.studentId}</td>
                        <td className="col-numeric">{stu.attendanceCount ?? 0}</td>
                        <td className="col-action">
                          <button
                            className="view-btn"
                            onClick={() => fetchStudentDetails(stu.studentId)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PDF BUTTON */}
              <button
                className="view-btn"
                style={{ marginTop: 10 }}
                onClick={() =>
                  downloadPDF("studentTableSection", "All_Students_Attendance")
                }
              >
                Download PDF
              </button>
            </section>
          )}

          {/* ======================================
              STUDENT DETAILS VIEW
          ====================================== */}
          {selectedStudent && (
            <section id="studentDetailsSection" className="details-section">

              <div className="details-header">
                <h3 className="section-title">Attendance Details</h3>
                <button className="back-btn" onClick={() => setSelectedStudent(null)}>Back</button>
              </div>

              <div className="table-wrapper">
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Class</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {studentAttendance.length === 0 && (
                      <tr>
                        <td colSpan={3} className="empty-row">No attendance records</td>
                      </tr>
                    )}

                    {studentAttendance.map((att, idx) => (
                      <tr key={idx}>
                        <td>{att.date ? new Date(att.date).toLocaleDateString() : "-"}</td>
                        <td>{att.className || "-"}</td>
                        <td className={att.status === "Present" ? "present" : "absent"}>
                          {att.status || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PDF BUTTON */}
              <button
                className="view-btn"
                style={{ marginTop: 10 }}
                onClick={() =>
                  downloadPDF("studentDetailsSection", `Attendance_${selectedStudent}`)
                }
              >
                Download Student PDF
              </button>
            </section>
          )}

          {/* ======================================
              DATE-WISE VIEW
          ====================================== */}
          {viewType === "date" && (
            <section id="dateWiseSection" className="table-section">
              <h3 className="section-title">Attendance for {selectedDate}</h3>

              <div className="table-wrapper">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Class</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="empty-row">No attendance records found</td>
                      </tr>
                    )}

                    {dates.map((rec, idx) => {
                      const att = rec.attendance?.[0];
                      return (
                        <tr key={idx}>
                          <td>{rec.studentName}</td>
                          <td>{rec.studentId}</td>
                          <td>{rec.className || "-"}</td>
                          <td className={att?.status === "Present" ? "present" : "absent"}>
                            {att?.status}
                          </td>
                          <td>{att?.date ? new Date(att.date).toLocaleDateString() : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PDF BUTTON */}
              <button
                className="view-btn"
                style={{ marginTop: 10 }}
                onClick={() =>
                  downloadPDF("dateWiseSection", `Attendance_${selectedDate}`)
                }
              >
                Download Datewise PDF
              </button>
            </section>
          )}
        </div>
      </main>

      {/* ==== STYLES remain unchanged ==== */}
      <style>{`
        :root{
          --max-width: 1100px;
          --gap: 16px;
          --accent: #3b82f6;
          --muted: #6b7280;
        }
        *{box-sizing: border-box}
        .portal-layout { background: #ffffff; min-height: 100vh; color: #111827; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
        .container { max-width: var(--max-width); margin: 0 auto; padding: 0 20px; width: 100%; }
        .portal-header { background: #1a1c23; color: white; }
        .portal-header .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; }
        .brand { display:flex; flex-direction: column; gap:4px; }
        .brand-title { margin:0; font-size:1.25rem; font-weight:600; color: #fff; }
        .brand-sub { margin:0; font-size:0.85rem; color: rgba(255,255,255,0.75); }
        .logout-btn { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.14); padding: 6px 12px; border-radius: 6px; cursor: pointer; }
        .attendance-container { padding: 28px 0 60px; }
        .page-header { display:flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
        .page-title { margin:0; font-size:1.25rem; font-weight:600; color:#111827; }
        .controls { display:flex; align-items:center; gap:12px; }
        .selector-row { display:flex; gap:8px; align-items:center; }
        .selector-btn { padding:6px 12px; border-radius:6px; border:none; background:#eef2ff; color:#0f172a; cursor:pointer; font-weight:500; font-size:0.95rem; }
        .selector-btn.active { background: var(--accent); color: white; }
        .date-input { padding:6px 10px; border-radius:6px; border:1px solid #d1d5db; background:#fff; color:#111827; font-size:0.95rem; }
        .course-select { padding: 6px 10px; border-radius: 6px; border: 1px solid #d1d5db; margin-right: 12px; font-size: 0.95rem; }
        .section-title { margin:0 0 12px 0; font-size:1rem; font-weight:600; color:#0f172a; }
        .table-wrapper { overflow-x:auto; border-radius:6px; }
        .student-table { width:100%; border-collapse: collapse; background: #111827; color: white; min-width: 700px; }
        .student-table thead th { text-align:left; padding:10px 12px; background:#111827; position: sticky; top:0; z-index:1; font-weight:600; color: #e6eef8; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .student-table tbody td { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.03); vertical-align: middle; }
        .student-table tbody tr:hover { background: rgba(255,255,255,0.02); }
        .col-numeric { text-align:center; width:90px; }
        .col-action { text-align:center; width:120px; }
        .empty-row { text-align:center; padding:12px; color: var(--muted); font-size:0.95rem; }
        .view-btn { padding:6px 10px; border-radius:6px; background: var(--accent); color: white; border: none; cursor: pointer; font-size:0.95rem; }
        .details-table { width:100%; min-width: 600px; border-collapse: collapse; background: transparent; }
        .details-table thead th { text-align:left; padding:8px 12px; color:#374151; border-bottom:1px solid #e6e8eb; }
        .details-table td { padding:8px 12px; border-bottom:1px solid #f3f4f6; }
        .details-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:10px; }
        .back-btn { padding:6px 12px; border-radius:6px; border:1px solid #8aacdfff; background: #8aacdfff; cursor:pointer; font-weight:500; }
        .present { color: #16a34a; font-weight:700; }
        .absent { color: #dc2626; font-weight:700; }
      `}</style>
    </div>
  );
}
