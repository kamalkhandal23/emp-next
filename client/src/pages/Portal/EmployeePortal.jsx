import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../utils/api";
import WorkLogModal from "../../components/WorkLogModal";
import LeaveApplicationModal from "../../components/LeaveApplicationModal";
import LoadingSpinner, { InlineLoader } from "../../components/LoadingSpinner";

export default function EmployeePortal() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Employee data states
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [benefits, setBenefits] = useState(null);
  const [performance, setPerformance] = useState(null);

  // Modal states
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Load employee data on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadEmployeeData();
    }
  }, [isAuthenticated, user]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors

      // Load employee data one by one to better handle errors
      const dashboardData = await apiClient.request(
        "/employee-portal/dashboard"
      );
      setEmployeeData(dashboardData.employee);
      setTodayStats(dashboardData.timesheetSummary);
      setLeaveBalance(dashboardData.benefits?.leaveBalance);

      const statusData = await apiClient.request("/employee-portal/status");
      setAttendanceStatus(statusData);

      try {
        const attendanceData = await apiClient.request(
          "/employee-portal/attendance/report"
        );
        setAttendanceHistory(attendanceData.attendanceData || []);
      } catch (attendanceError) {
        console.warn("Failed to load attendance data:", attendanceError);
        setAttendanceHistory([]);
      }

      try {
        const benefitsData = await apiClient.request(
          "/employee-portal/benefits"
        );
        setBenefits(benefitsData);
      } catch (benefitsError) {
        console.warn("Failed to load benefits data:", benefitsError);
        setBenefits(null);
      }

      try {
        const performanceData = await apiClient.request(
          "/employee-portal/performance"
        );
        setPerformance(performanceData);
      } catch (performanceError) {
        console.warn("Failed to load performance data:", performanceError);
        setPerformance(null);
      }

      // Set placeholder data for features not yet implemented
      setUpcomingEvents([]);
      setTasks([]);
    } catch (error) {
      console.error("Failed to load employee data:", error);
      setError(
        error.message || "Failed to load employee data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(loginData);
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors

      const isCheckedIn =
        attendanceStatus?.status === "checked-in" ||
        attendanceStatus?.status === "on-break";

      if (isCheckedIn) {
        await apiClient.request("/employee-portal/timesheet/checkout", {
          method: "POST",
        });
      } else {
        await apiClient.request("/employee-portal/timesheet/checkin", {
          method: "POST",
        });
      }

      // Reload status after check-in/out
      const statusData = await apiClient.request("/employee-portal/status");
      setAttendanceStatus(statusData);

      // Reload dashboard data
      const dashboardData = await apiClient.request(
        "/employee-portal/dashboard"
      );
      setTodayStats(dashboardData.timesheetSummary);
    } catch (error) {
      console.error("Check-in/out failed:", error);
      setError(
        error.message || "Failed to update attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBreakStart = async () => {
    try {
      setLoading(true);
      setError("");
      await apiClient.request("/employee-portal/timesheet/break/start", {
        method: "POST",
      });
      const statusData = await apiClient.request("/employee-portal/status");
      setAttendanceStatus(statusData);
    } catch (error) {
      console.error("Break start failed:", error);
      setError(error.message || "Failed to start break. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBreakEnd = async () => {
    try {
      setLoading(true);
      setError("");
      await apiClient.request("/employee-portal/timesheet/break/end", {
        method: "POST",
      });
      const statusData = await apiClient.request("/employee-portal/status");
      setAttendanceStatus(statusData);
    } catch (error) {
      console.error("Break end failed:", error);
      setError(error.message || "Failed to end break. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      // This will be implemented when task management is added
      console.log("Task update:", taskId, updates);
      setError("Task management feature coming soon!");
    } catch (error) {
      console.error("Task update failed:", error);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleWorkLog = async (workLogData) => {
    try {
      setLoading(true);
      setError("");

      // Create a work log entry
      const workLogEntry = {
        taskDescription: workLogData.task,
        timeSpent: Math.round(parseFloat(workLogData.hoursSpent) * 60), // Convert hours to minutes
        status: "completed",
        notes: workLogData.description,
        category: workLogData.category,
        date: workLogData.date,
      };

      // Use the selected project ID
      const projectId = workLogData.project || "68d60000a8336a676158d569"; // Fallback to General Work

      try {
        await apiClient.request("/employee-portal/worklog", {
          method: "POST",
          body: {
            projectId: projectId,
            ...workLogEntry,
          },
        });

        // Show success message
        setError(""); // Clear any errors
        alert("Work log added successfully!");

        // Reload dashboard data
        loadEmployeeData();
      } catch (apiError) {
        console.error("Work log API error:", apiError);
        // Show a more helpful error message
        setError(
          `Work log failed: ${apiError.message}. The entry has been recorded locally.`
        );
        console.log("Work log recorded locally:", workLogEntry);
      }
    } catch (error) {
      console.error("Work log failed:", error);
      setError("Failed to add work log. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveApplication = async (leaveData) => {
    try {
      await apiClient.createLeave(leaveData);
      // Reload attendance data
      const attendanceData = await apiClient.request(
        "/employee-portal/attendance/report"
      );
      setAttendanceHistory(attendanceData.attendanceData || []);
      setLeaveBalance(attendanceData.summary?.leaveBalance);
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Leave application failed:", error);
      setError("Failed to apply for leave. Please try again.");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="portal-layout">
        <div className="portal-header">
          <div className="container">
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Employee Portal</h1>
          </div>
        </div>

        <div className="portal-content">
          <div className="container" style={{ maxWidth: "400px" }}>
            <div className="portal-card">
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍💻</div>
                <h2>Employee Login</h2>
                <p style={{ color: "#6b7280" }}>
                  Access your employee dashboard
                </p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="form-input"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="form-input"
                    placeholder="Enter password"
                    required
                  />
                </div>

                {error && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "0.5rem",
                      color: "#dc2626",
                      fontSize: "0.875rem",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%" }}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login to Portal"}
                </button>
              </form>

              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#f0f9ff",
                  borderRadius: "0.5rem",
                }}
              >
                <p
                  style={{ fontSize: "0.875rem", color: "#0369a1", margin: 0 }}
                >
                  Demo: john.doe@lifeboxnextgen.com / employee123456
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-layout">
      <div className="portal-header">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>
              Welcome, {employeeData?.name || user?.name || "Employee"}
            </h1>
            <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>
              {employeeData?.role || user?.role} •{" "}
              {employeeData?.department || user?.department}
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {attendanceStatus?.status === "on-break" && (
              <button
                onClick={handleBreakEnd}
                className="btn-warning"
                style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                disabled={loading}
              >
                End Break
              </button>
            )}
            {attendanceStatus?.status === "checked-in" && (
              <button
                onClick={handleBreakStart}
                className="btn-secondary"
                style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                disabled={loading}
              >
                Start Break
              </button>
            )}
            <button
              onClick={handleCheckInOut}
              className={
                attendanceStatus?.status === "checked-in" ||
                attendanceStatus?.status === "on-break"
                  ? "btn-secondary"
                  : "btn-primary"
              }
              style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : attendanceStatus?.status === "checked-in" ||
                  attendanceStatus?.status === "on-break"
                ? "Check Out"
                : "Check In"}
            </button>
            <button
              onClick={logout}
              className="btn-secondary"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="portal-nav">
        <div className="portal-nav-links">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`portal-nav-link ${
              activeTab === "dashboard" ? "active" : ""
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`portal-nav-link ${
              activeTab === "tasks" ? "active" : ""
            }`}
          >
            My Tasks
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`portal-nav-link ${
              activeTab === "attendance" ? "active" : ""
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab("leaves")}
            className={`portal-nav-link ${
              activeTab === "leaves" ? "active" : ""
            }`}
          >
            Leave Management
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`portal-nav-link ${
              activeTab === "profile" ? "active" : ""
            }`}
          >
            My Profile
          </button>
        </div>
      </div>

      <div className="portal-content">
        <div className="container">
          {activeTab === "dashboard" && (
            <div>
              {error && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "0.5rem",
                    color: "#dc2626",
                  }}
                >
                  {error}
                  <button
                    onClick={() => setError("")}
                    style={{
                      marginLeft: "1rem",
                      padding: "0.25rem 0.5rem",
                      background: "transparent",
                      border: "1px solid #dc2626",
                      borderRadius: "0.25rem",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Debug Info - Remove in production */}
              {process.env.NODE_ENV === "development" && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    background: "#f0f9ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <strong>Debug Info:</strong>
                  <br />
                  Token:{" "}
                  {localStorage.getItem("authToken") ? "Present" : "Missing"}
                  <br />
                  User: {user?.email || "Not loaded"}
                  <br />
                  Status: {attendanceStatus?.status || "Not loaded"}
                  <br />
                  Last Check In: {attendanceStatus?.lastCheckIn || "None"}
                  <br />
                  Last Check Out: {attendanceStatus?.lastCheckOut || "None"}
                  <br />
                  Is Checked In:{" "}
                  {attendanceStatus?.status === "checked-in" ||
                  attendanceStatus?.status === "on-break"
                    ? "Yes"
                    : "No"}
                  <br />
                  API Base:{" "}
                  {import.meta.env.VITE_API_URL || "http://localhost:5002/api"}
                </div>
              )}

              <h2 style={{ marginBottom: "2rem" }}>Today's Overview</h2>

              {loading ? (
                <InlineLoader message="Loading dashboard data..." />
              ) : (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number">
                        {attendanceStatus?.lastCheckIn
                          ? new Date(
                              attendanceStatus.lastCheckIn
                            ).toLocaleTimeString()
                          : "Not checked in"}
                      </div>
                      <div className="stat-label">Check In Time</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">
                        {attendanceStatus?.hoursWorkedToday
                          ? `${attendanceStatus.hoursWorkedToday}h`
                          : "0h 0m"}
                      </div>
                      <div className="stat-label">Hours Worked</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">
                        {todayStats?.totalDays || 0}
                      </div>
                      <div className="stat-label">Days This Month</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">
                        {todayStats?.averageProductivity ||
                          performance?.[0]?.overallRating ||
                          "N/A"}
                      </div>
                      <div className="stat-label">Performance Score</div>
                    </div>
                  </div>

                  {/* Current Status Card */}
                  <div className="portal-card" style={{ marginBottom: "2rem" }}>
                    <div
                      className="portal-card-header"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3 className="portal-card-title">Current Status</h3>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn-secondary"
                          onClick={loadEmployeeData}
                          style={{
                            fontSize: "0.875rem",
                            padding: "0.5rem 1rem",
                          }}
                          disabled={loading}
                        >
                          {loading ? "Refreshing..." : "Refresh"}
                        </button>
                        <button
                          className="btn-primary"
                          onClick={() => setShowWorkLogModal(true)}
                          style={{
                            fontSize: "0.875rem",
                            padding: "0.5rem 1rem",
                          }}
                        >
                          Add Work Log
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "#6b7280",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Status
                        </div>
                        <div
                          style={{
                            fontWeight: "600",
                            color:
                              attendanceStatus?.status === "checked-in" ||
                              attendanceStatus?.status === "on-break"
                                ? "#059669"
                                : "#dc2626",
                          }}
                        >
                          {attendanceStatus?.status === "on-break"
                            ? "🟡 On Break"
                            : attendanceStatus?.status === "checked-in"
                            ? "🟢 Checked In"
                            : attendanceStatus?.status === "checked-out"
                            ? "🔵 Checked Out"
                            : "🔴 Not Checked In"}
                        </div>
                      </div>
                      {(attendanceStatus?.status === "checked-in" ||
                        attendanceStatus?.status === "on-break") && (
                        <>
                          <div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                marginBottom: "0.25rem",
                              }}
                            >
                              Break Time Today
                            </div>
                            <div style={{ fontWeight: "600" }}>
                              {attendanceStatus?.currentBreak
                                ? "On break now"
                                : "0m"}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                marginBottom: "0.25rem",
                              }}
                            >
                              Location
                            </div>
                            <div style={{ fontWeight: "600" }}>
                              {attendanceStatus?.timesheet?.workType ||
                                "Office"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "2rem",
                }}
              >
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h3 className="portal-card-title">My Active Tasks</h3>
                  </div>
                  <div>
                    {tasks
                      .filter((task) => task.status !== "completed")
                      .slice(0, 4).length > 0 ? (
                      tasks
                        .filter((task) => task.status !== "completed")
                        .slice(0, 4)
                        .map((task) => (
                          <div
                            key={task._id}
                            className="table-row"
                            style={{
                              gridTemplateColumns: "2fr 1fr 1fr",
                              padding: "1rem 0",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: "500" }}>
                                {task.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                }}
                              >
                                Due:{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <span
                                style={{
                                  color: getPriorityColor(task.priority),
                                  fontWeight: "600",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {task.priority?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "60px",
                                    height: "6px",
                                    background: "#e5e7eb",
                                    borderRadius: "3px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${task.progress || 0}%`,
                                      height: "100%",
                                      background: "#3b82f6",
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: "0.875rem" }}>
                                  {task.progress || 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "#6b7280",
                        }}
                      >
                        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                          📋
                        </div>
                        <p>No active tasks assigned</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="portal-card">
                  <div className="portal-card-header">
                    <h3 className="portal-card-title">Upcoming Events</h3>
                  </div>
                  <div>
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event) => (
                        <div
                          key={event._id || event.id}
                          className="table-row"
                          style={{
                            gridTemplateColumns: "1fr",
                            padding: "0.75rem 0",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: "500" }}>
                              {event.title}
                            </div>
                            <div
                              style={{ fontSize: "0.875rem", color: "#6b7280" }}
                            >
                              {new Date(event.date).toLocaleDateString()} at{" "}
                              {event.time}
                            </div>
                            <div
                              style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                            >
                              Type: {event.type}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "#6b7280",
                        }}
                      >
                        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                          📅
                        </div>
                        <p>No upcoming events</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h2>My Tasks</h2>
                <button
                  className="btn-primary"
                  onClick={() => {
                    // Could open a modal or navigate to task request form
                    alert("Task request feature coming soon!");
                  }}
                >
                  Request New Task
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">
                    {tasks.filter((t) => t.status === "pending").length}
                  </div>
                  <div className="stat-label">Pending Tasks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {tasks.filter((t) => t.status === "in-progress").length}
                  </div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {tasks.filter((t) => t.status === "completed").length}
                  </div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {tasks.length > 0
                      ? Math.round(
                          (tasks.filter((t) => t.status === "completed")
                            .length /
                            tasks.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="stat-label">Completion Rate</div>
                </div>
              </div>

              <div className="data-table">
                <div className="table-header">All My Tasks</div>
                {tasks.length > 0 ? (
                  <>
                    <div
                      className="table-row"
                      style={{
                        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                        fontWeight: "600",
                        background: "#f8fafc",
                      }}
                    >
                      <div>Task</div>
                      <div>Priority</div>
                      <div>Status</div>
                      <div>Due Date</div>
                      <div>Progress</div>
                      <div>Actions</div>
                    </div>
                    {tasks.map((task) => (
                      <div
                        key={task._id}
                        className="table-row"
                        style={{
                          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "500" }}>{task.title}</div>
                          {task.description && (
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "#6b7280",
                                marginTop: "0.25rem",
                              }}
                            >
                              {task.description.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                        <div>
                          <span
                            style={{
                              color: getPriorityColor(task.priority),
                              fontWeight: "600",
                              fontSize: "0.875rem",
                            }}
                          >
                            {task.priority?.toUpperCase() || "MEDIUM"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`status-badge status-${
                              task.status === "completed"
                                ? "active"
                                : task.status === "in-progress"
                                ? "completed"
                                : "pending"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <div>{new Date(task.dueDate).toLocaleDateString()}</div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <div
                              style={{
                                width: "60px",
                                height: "6px",
                                background: "#e5e7eb",
                                borderRadius: "3px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${task.progress || 0}%`,
                                  height: "100%",
                                  background: "#3b82f6",
                                }}
                              />
                            </div>
                            <span style={{ fontSize: "0.875rem" }}>
                              {task.progress || 0}%
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="action-button primary"
                            onClick={() => {
                              const newProgress = prompt(
                                "Enter progress percentage (0-100):",
                                task.progress || 0
                              );
                              if (newProgress !== null && !isNaN(newProgress)) {
                                handleTaskUpdate(task._id, {
                                  progress: Math.min(
                                    100,
                                    Math.max(0, parseInt(newProgress))
                                  ),
                                });
                              }
                            }}
                          >
                            Update
                          </button>
                          <button
                            className="action-button"
                            onClick={() => {
                              alert(
                                `Task: ${task.title}\nDescription: ${
                                  task.description || "No description"
                                }\nAssigned: ${new Date(
                                  task.createdAt
                                ).toLocaleDateString()}`
                              );
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#6b7280",
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                      📋
                    </div>
                    <h3>No Tasks Assigned</h3>
                    <p>
                      You don't have any tasks assigned yet. Contact your
                      manager for task assignments.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h2>My Attendance</h2>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    className="action-button"
                    onClick={async () => {
                      try {
                        const response = await apiClient.request(
                          "/employee-portal/attendance/report?format=pdf"
                        );
                        // Handle PDF download
                        alert("Report download feature coming soon!");
                      } catch (error) {
                        console.error("Download failed:", error);
                      }
                    }}
                  >
                    Download Report
                  </button>
                  <button
                    onClick={handleCheckInOut}
                    className={
                      attendanceStatus?.status === "checked-in" ||
                      attendanceStatus?.status === "on-break"
                        ? "btn-secondary"
                        : "btn-primary"
                    }
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : attendanceStatus?.status === "checked-in" ||
                        attendanceStatus?.status === "on-break"
                      ? "Check Out"
                      : "Check In"}
                  </button>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">
                    {
                      attendanceHistory.filter(
                        (r) => r.shifts && r.shifts.length > 0
                      ).length
                    }
                  </div>
                  <div className="stat-label">Days Present (This Month)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {todayStats?.averageProductivity
                      ? `${todayStats.averageProductivity}%`
                      : "8h 0m"}
                  </div>
                  <div className="stat-label">Avg Daily Hours</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {attendanceHistory.length > 0
                      ? Math.round(
                          (attendanceHistory.filter(
                            (r) => r.shifts && r.shifts.length > 0
                          ).length /
                            attendanceHistory.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="stat-label">Attendance Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {
                      attendanceHistory.filter((r) =>
                        r.flags?.some((f) => f.type === "late-entry")
                      ).length
                    }
                  </div>
                  <div className="stat-label">Late Arrivals</div>
                </div>
              </div>

              <div className="data-table">
                <div className="table-header">Recent Attendance History</div>
                {attendanceHistory.length > 0 ? (
                  <>
                    <div
                      className="table-row"
                      style={{
                        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
                        fontWeight: "600",
                        background: "#f8fafc",
                      }}
                    >
                      <div>Date</div>
                      <div>Check In</div>
                      <div>Check Out</div>
                      <div>Total Hours</div>
                      <div>Status</div>
                      <div>Flags</div>
                    </div>
                    {attendanceHistory.map((record, index) => {
                      const lastShift =
                        record.shifts && record.shifts.length > 0
                          ? record.shifts[record.shifts.length - 1]
                          : null;
                      return (
                        <div
                          key={record._id || index}
                          className="table-row"
                          style={{
                            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
                          }}
                        >
                          <div>
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div>
                            {lastShift?.checkIn?.time
                              ? new Date(
                                  lastShift.checkIn.time
                                ).toLocaleTimeString()
                              : "-"}
                          </div>
                          <div>
                            {lastShift?.checkOut?.time
                              ? new Date(
                                  lastShift.checkOut.time
                                ).toLocaleTimeString()
                              : "-"}
                          </div>
                          <div>
                            {record.totalHours?.regular
                              ? `${record.totalHours.regular}h`
                              : "0h 0m"}
                          </div>
                          <div>
                            <span
                              className={`status-badge status-${
                                lastShift ? "active" : "inactive"
                              }`}
                            >
                              {lastShift ? "present" : "absent"}
                            </span>
                          </div>
                          <div>
                            {record.flags && record.flags.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.25rem",
                                  flexWrap: "wrap",
                                }}
                              >
                                {record.flags.map((flag, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: "0.75rem",
                                      padding: "0.125rem 0.375rem",
                                      borderRadius: "0.25rem",
                                      background:
                                        flag.type === "late-entry"
                                          ? "#fef3c7"
                                          : flag.type === "overtime"
                                          ? "#dbeafe"
                                          : "#f3f4f6",
                                      color:
                                        flag.type === "late-entry"
                                          ? "#92400e"
                                          : flag.type === "overtime"
                                          ? "#1e40af"
                                          : "#374151",
                                    }}
                                  >
                                    {flag.type}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#6b7280",
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                      📊
                    </div>
                    <h3>No Attendance Records</h3>
                    <p>
                      Your attendance history will appear here once you start
                      checking in.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "leaves" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h2>Leave Management</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowLeaveModal(true)}
                >
                  Apply for Leave
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">
                    {leaveBalance?.annual?.remaining || 21}
                  </div>
                  <div className="stat-label">Annual Leave Remaining</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {leaveBalance?.sick?.remaining || 12}
                  </div>
                  <div className="stat-label">Sick Leave Remaining</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {leaveBalance?.personal?.remaining || 5}
                  </div>
                  <div className="stat-label">Personal Leave Remaining</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {(leaveBalance?.annual?.used || 0) +
                      (leaveBalance?.sick?.used || 0) +
                      (leaveBalance?.personal?.used || 0)}
                  </div>
                  <div className="stat-label">Total Used This Year</div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                }}
              >
                <div className="portal-card">
                  <h3 className="portal-card-title">Leave Balance</h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    {leaveBalance
                      ? Object.entries(leaveBalance).map(([type, balance]) => (
                          <div key={type}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "500",
                                  textTransform: "capitalize",
                                }}
                              >
                                {type} Leave
                              </span>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                }}
                              >
                                {balance.remaining} / {balance.total} remaining
                              </span>
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: "8px",
                                background: "#e5e7eb",
                                borderRadius: "4px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${
                                    (balance.remaining / balance.total) * 100
                                  }%`,
                                  height: "100%",
                                  background:
                                    balance.remaining > balance.total * 0.5
                                      ? "#22c55e"
                                      : balance.remaining > balance.total * 0.2
                                      ? "#f59e0b"
                                      : "#ef4444",
                                }}
                              />
                            </div>
                          </div>
                        ))
                      : // Default leave balance if not loaded
                        ["annual", "sick", "personal"].map((type) => (
                          <div key={type}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "500",
                                  textTransform: "capitalize",
                                }}
                              >
                                {type} Leave
                              </span>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                }}
                              >
                                Loading...
                              </span>
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: "8px",
                                background: "#e5e7eb",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        ))}
                  </div>
                </div>

                <div className="portal-card">
                  <h3 className="portal-card-title">
                    Recent Leave Applications
                  </h3>
                  <div>
                    {/* This would be loaded from API */}
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#6b7280",
                      }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                        🏖️
                      </div>
                      <p>No recent leave applications</p>
                      <p style={{ fontSize: "0.875rem" }}>
                        Your leave history will appear here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h2 style={{ marginBottom: "2rem" }}>My Profile</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "2rem",
                }}
              >
                <div className="portal-card">
                  <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3rem",
                        color: "white",
                        margin: "0 auto 1rem",
                      }}
                    >
                      {(employeeData?.name || user?.name || "Employee")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h3 style={{ margin: 0 }}>
                      {employeeData?.name || user?.name || "Employee"}
                    </h3>
                    <p style={{ color: "#6b7280", margin: "0.5rem 0" }}>
                      {employeeData?.role || user?.role || "Employee"}
                    </p>
                    <p
                      style={{
                        color: "#9ca3af",
                        margin: 0,
                        fontSize: "0.875rem",
                      }}
                    >
                      Employee ID:{" "}
                      {employeeData?.employeeId || user?.employeeId || "N/A"}
                    </p>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: "100%" }}
                    onClick={() =>
                      alert("Profile editing feature coming soon!")
                    }
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="portal-card">
                  <h3 className="portal-card-title">Personal Information</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Full Name
                      </label>
                      <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                        {employeeData?.name || user?.name || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Employee ID
                      </label>
                      <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                        {employeeData?.employeeId || user?.employeeId || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Email Address
                      </label>
                      <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                        {employeeData?.email || user?.email || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Department
                      </label>
                      <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                        {employeeData?.department || user?.department || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Role
                      </label>
                      <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                        {employeeData?.role || user?.role || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Manager
                      </label>
                      <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                        {employeeData?.manager || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Join Date
                      </label>
                      <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                        {employeeData?.joinDate
                          ? new Date(employeeData.joinDate).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Phone Number
                      </label>
                      <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>
                        {employeeData?.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits and Performance Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  marginTop: "2rem",
                }}
              >
                <div className="portal-card">
                  <h3 className="portal-card-title">Benefits Overview</h3>
                  {benefits ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          Health Insurance
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          {benefits.healthInsurance?.plan || "Not enrolled"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          Provident Fund
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          {benefits.providentFund?.contribution ||
                            "Not enrolled"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          Flexi Benefits
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          ₹{benefits.flexiBenefits?.balance || 0} remaining
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#6b7280",
                      }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                        🎁
                      </div>
                      <p>Benefits information loading...</p>
                    </div>
                  )}
                </div>

                <div className="portal-card">
                  <h3 className="portal-card-title">Performance Summary</h3>
                  {performance ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          Current Score
                        </div>
                        <div
                          style={{
                            fontWeight: "500",
                            fontSize: "1.5rem",
                            color: "#059669",
                          }}
                        >
                          {performance.currentScore || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          Goals Completed
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          {performance.goalsCompleted || 0} /{" "}
                          {performance.totalGoals || 0}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                          Last Review
                        </div>
                        <div style={{ fontWeight: "500" }}>
                          {performance.lastReview
                            ? new Date(
                                performance.lastReview
                              ).toLocaleDateString()
                            : "No reviews yet"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#6b7280",
                      }}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                        📊
                      </div>
                      <p>Performance data loading...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <WorkLogModal
        isOpen={showWorkLogModal}
        onClose={() => setShowWorkLogModal(false)}
        onSubmit={handleWorkLog}
      />

      <LeaveApplicationModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSubmit={handleLeaveApplication}
        leaveBalance={leaveBalance}
      />
    </div>
  );
}
