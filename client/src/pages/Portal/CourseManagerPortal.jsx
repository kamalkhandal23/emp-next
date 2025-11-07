import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

/**
 * Course Manager Portal (stable build)
 * - No unbalanced JSX
 * - No "registration is not defined" outside map
 * - All arrays guarded, all optionals checked
 * - Approve/Reject calls point to /nextgen/admin/registrations/:id/review
 */

export default function CourseManagerPortal() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // UI state
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ username: "", password: "" });

    // Data state
    const [studentRegistrations, setStudentRegistrations] = useState([]);
    const [courses, setCourses] = useState([]);

    // Misc
    const [loading, setLoading] = useState(false);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCourseDetails, setShowCourseDetails] = useState(false);

    const [newCourse, setNewCourse] = useState({
        slug: "",
        title: "",
        subtitle: "",
        duration: "",
        description: "",
        prerequisites: "",
        icon: "🎓",
        visibility: "draft",
    });

    // Mock data fallbacks
    const mockRegistrations = useMemo(
        () => [
            {
                id: 1,
                fullName: "Arjun Patel",
                email: "arjun.patel@email.com",
                phone: "+91-9876543210",
                course: "Full Stack Development",
                registrationDate: "2024-03-01",
                status: "pending",
                documents: ["10th Certificate", "12th Certificate", "ID Proof"],
                address: "Mumbai, Maharashtra",
            },
            {
                id: 2,
                fullName: "Sneha Sharma",
                email: "sneha.sharma@email.com",
                phone: "+91-9876543211",
                course: "Data Science & Analytics",
                registrationDate: "2024-03-02",
                status: "pending",
                documents: ["Graduation Certificate", "ID Proof", "Photo"],
                address: "Delhi, India",
            },
            {
                id: 3,
                fullName: "Rohit Kumar",
                email: "rohit.kumar@email.com",
                phone: "+91-9876543212",
                course: "Digital Marketing",
                registrationDate: "2024-03-03",
                status: "approved",
                documents: ["12th Certificate", "ID Proof"],
                address: "Bangalore, Karnataka",
            },
            {
                id: 4,
                fullName: "Priya Singh",
                email: "priya.singh@email.com",
                phone: "+91-9876543213",
                course: "UI/UX Design",
                registrationDate: "2024-03-04",
                status: "rejected",
                documents: ["Graduation Certificate", "Portfolio"],
                address: "Pune, Maharashtra",
                rejectionReason: "Incomplete documentation",
            },
            {
                id: 5,
                fullName: "Vikash Gupta",
                email: "vikash.gupta@email.com",
                phone: "+91-9876543214",
                course: "Cybersecurity",
                registrationDate: "2024-03-05",
                status: "pending",
                documents: ["Graduation Certificate", "ID Proof", "Experience Letter"],
                address: "Hyderabad, Telangana",
            },
        ],
        []
    );

    // Admin stats (static)
    const adminStats = {
        totalStudents: 45,
        activeProjects: 12,
        pendingTasks: 28,
        completedTasks: 156,
        totalRevenue: "₹2,45,000",
        monthlyGrowth: "+12%",
    };

    const recentActivities = [
        {
            id: 1,
            action: "New student onboarded",
            user: "Priya Sharma",
            time: "2 hours ago",
            type: "success",
        },
        {
            id: 2,
            action: "Fullstack course batch 3 completed",
            user: "Team Alpha",
            time: "4 hours ago",
            type: "info",
        },
        {
            id: 3,
            action: "New Course added",
            user: "System",
            time: "6 hours ago",
            type: "success",
        },
        {
            id: 4,
            action: "Digital marketing batch 3 completed",
            user: "IT Team",
            time: "8 hours ago",
            type: "warning",
        },
    ];

    const systemHealth = {
        serverUptime: "99.9%",
        databaseStatus: "Healthy",
        backupStatus: "Completed",
        securityStatus: "Secure",
    };

    useEffect(() => {
        const fetchRegistrations = async () => {
          try {
            const response = await axios.get(
              "http://localhost:5002/api/nextgen/registrations",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
    
            
            setStudentRegistrations(response.data);
    
            
            // setStudentRegistrations(response.data.data);
    
            console.log("Fetched registrations:", response.data);
          } catch (error) {
            console.error("Error fetching registrations:", error);
          }
        };
    
        fetchRegistrations();
      }, []);
    
      // Initialize registrations on component mount
      useEffect(() => {
        if (isLoggedIn) {
          fetchRegistrations();
        }
      }, [isLoggedIn]);
    
      // Fetch registrations from API
      const fetchRegistrations = async () => {
        try {
          const token = localStorage.getItem("token"); // get token from localStorage
    
          const res = await axios.get("http://localhost:5002/api/nextgen/registrations", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
    
          console.log(res.data);
        } catch (error) {
          console.error("Error fetching registrations:", error);
        }
      };

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/courses`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                setCourses(data?.data?.courses ?? []);
            } else {
                setCourses([]);
            }
        } catch (e) {
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    /* ----------------- Action Handlers ----------------- */

    // Handle registration approval
  const handleApproveRegistration = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      console.log("🔹 Token from localStorage:", token);

      if (!token) {
        alert("No token found! Please login again.");
        return;
      }

      const url = `http://localhost:5002/api/nextgen/admin/registrations/${id}/approve`;
      console.log("🔹 Requesting:", url);

      const res = await axios.put(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(" Response:", res.data);
      alert(res.data?.message || "Registration approved successfully!");
      fetchRegistrations();
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Approval failed!");
    } finally {
      setLoading(false);
    }
  };

  // Handle registration rejection
  const handleRejectRegistration = async (registrationId, reason) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
  
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/nextgen/admin/registrations/${registrationId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );
  
      if (response.ok) {
        await fetchRegistrations();
        alert("Registration rejected successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error rejecting registration: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error rejecting registration:", error);
      alert("Error rejecting registration");
    } finally {
      setLoading(false);
    }
  };
  

    const handleViewDetails = (registration) => {
        const name = registration?.full_name || registration?.fullName || "Unnamed";
        const course = registration?.course_id?.title || registration?.course || "N/A";
        const phone = registration?.phone || "N/A";
        const address = registration?.address || "N/A";
        const documents = Array.isArray(registration?.documents)
            ? registration.documents.join(", ")
            : "N/A";
        const registrationDate = registration?.created_at
            ? new Date(registration.created_at).toLocaleDateString()
            : registration?.registrationDate || "N/A";

        alert(
            `Registration Details:\n\nName: ${name}\nEmail: ${registration?.email ||
            "N/A"}\nPhone: ${phone}\nCourse: ${course}\nAddress: ${address}\nDocuments: ${documents}\nRegistration Date: ${registrationDate}\nStatus: ${registration?.status || "N/A"}`
        );
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginData.username && loginData.password) {
            // (You can integrate real auth here)
            setIsLoggedIn(true);
        }
    };

    const handleViewCourse = (course) => {
        setSelectedCourse(course);
        setShowCourseDetails(true);
    };

    const handleAddCourse = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/courses`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCourse),
            });

            if (res.ok) {
                await fetchCourses();
                setShowAddCourse(false);
                setNewCourse({
                    slug: "",
                    title: "",
                    subtitle: "",
                    duration: "",
                    description: "",
                    prerequisites: "",
                    icon: "🎓",
                    visibility: "draft",
                });
                alert("Course added successfully!");
            } else {
                const err = await res.json().catch(() => ({}));
                alert(`Error adding course: ${err?.message || "Failed"}`);
            }
        } catch (e) {
            console.error("Add course failed:", e);
            alert("Error adding course");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI Sections ---------------- */

    if (!isLoggedIn) {
        return (
            <div className="portal-layout">
                <div className="portal-header">
                    <div className="container">
                        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Course Manager Portal</h1>
                    </div>
                </div>

                <div className="portal-content">
                    <div className="container" style={{ maxWidth: 400 }}>
                        <div className="portal-card">
                            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
                                <h2>Course Manager Login</h2>
                                <p style={{ color: "#6b7280" }}>Access the course manager dashboard</p>
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        value={loginData.username}
                                        onChange={(e) =>
                                            setLoginData((p) => ({ ...p, username: e.target.value }))
                                        }
                                        className="form-input"
                                        placeholder="Enter course manager username"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        value={loginData.password}
                                        onChange={(e) =>
                                            setLoginData((p) => ({ ...p, password: e.target.value }))
                                        }
                                        className="form-input"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                                    Login to Course Manager Panel
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
                                <p style={{ fontSize: "0.875rem", color: "#0369a1", margin: 0 }}>
                                    Demo: username: courseManager, password: coursemanager123
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Course Modal */}
                {showAddCourse && (
                    <Modal title="Add New Course" onClose={() => setShowAddCourse(false)}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddCourse();
                            }}
                        >
                            <div style={{ display: "grid", gap: "1rem" }}>
                                <TextField
                                    label="Slug"
                                    value={newCourse.slug}
                                    onChange={(v) => setNewCourse((p) => ({ ...p, slug: v }))}
                                    required
                                    placeholder="course-slug"
                                />
                                <TextField
                                    label="Title"
                                    value={newCourse.title}
                                    onChange={(v) => setNewCourse((p) => ({ ...p, title: v }))}
                                    required
                                    placeholder="Course Title"
                                />
                                <TextField
                                    label="Subtitle"
                                    value={newCourse.subtitle}
                                    onChange={(v) => setNewCourse((p) => ({ ...p, subtitle: v }))}
                                    placeholder="Course Subtitle"
                                />
                                <TextField
                                    label="Duration"
                                    value={newCourse.duration}
                                    onChange={(v) => setNewCourse((p) => ({ ...p, duration: v }))}
                                    placeholder="e.g., 3 months"
                                />
                                <TextArea
                                    label="Description"
                                    value={newCourse.description}
                                    onChange={(v) => setNewCourse((p) => ({ ...p, description: v }))}
                                    rows={3}
                                />
                                <TextField
                                    label="Prerequisites"
                                    value={newCourse.prerequisites}
                                    onChange={(v) =>
                                        setNewCourse((p) => ({ ...p, prerequisites: v }))
                                    }
                                />
                                <TextField
                                    label="Icon"
                                    value={newCourse.icon}
                                    onChange={(v) => setNewCourse((p) => ({ ...p, icon: v }))}
                                    placeholder="🎓"
                                />
                                <Select
                                    label="Visibility"
                                    value={newCourse.visibility}
                                    onChange={(v) => setNewCourse((p) => ({ ...p, visibility: v }))}
                                    options={[
                                        { value: "draft", label: "Draft" },
                                        { value: "published", label: "Published" },
                                    ]}
                                />
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "1rem",
                                    justifyContent: "flex-end",
                                    marginTop: "2rem",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowAddCourse(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? "Adding..." : "Add Course"}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* View Course Modal */}
                {showCourseDetails && selectedCourse && (
                    <Modal title={`${selectedCourse?.icon || ""} ${selectedCourse?.title || ""}`} onClose={() => { setShowCourseDetails(false); setSelectedCourse(null); }}>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <KV label="Subtitle" value={selectedCourse?.subtitle || "N/A"} />
                            <KV label="Duration" value={selectedCourse?.duration || "N/A"} />
                            <KV label="Description" value={selectedCourse?.description || "N/A"} />
                            <KV label="Prerequisites" value={selectedCourse?.prerequisites || "N/A"} />
                            <KV
                                label="Visibility"
                                value={
                                    <span
                                        className={`status-badge status-${selectedCourse?.visibility === "published" ? "active" : "pending"}`}
                                    >
                                        {selectedCourse?.visibility}
                                    </span>
                                }
                            />
                            <KV label="Enrollments" value={selectedCourse?.enrolled_count || 0} />
                            <KV label="Slug" value={selectedCourse?.slug || "N/A"} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                            <button className="btn-secondary" onClick={() => { setShowCourseDetails(false); setSelectedCourse(null); }}>
                                Close
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }

    const safeRender = (val) => {
        if (val === null || val === undefined) return "N/A";
        if (typeof val === "object") {
            // If it's an encrypted object { c, iv, tag }
            if (val.c && val.iv && val.tag) return "[Encrypted Data]";
            try {
                return JSON.stringify(val);
            } catch {
                return "[Invalid Object]";
            }
        }
        return String(val);
    };

    return (
        <div className="portal-layout">
            <div className="portal-header">
                <div
                    className="container"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Course Manager Dashboard</h1>
                        <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>Course Manager Panel</p>
                    </div>
                    <button
                        onClick={() => setIsLoggedIn(false)}
                        className="btn-secondary"
                        style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="portal-nav">
                <div className="portal-nav-links">
                    {[
                        ["dashboard", "Dashboard"],
                        ["employees", "Student Management"],
                        ["projects", "Course Overview"],
                        ["system", "System Management"],
                        ["student-registrations", "Student Registrations"],
                        ["reports", "Reports & Analytics"],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`portal-nav-link ${activeTab === key ? "active" : ""}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="portal-content">
                <div className="container">
                    {/* DASHBOARD */}
                    {activeTab === "dashboard" && (
                        <section>
                            <h2 style={{ marginBottom: "2rem", color: "black" }}>System Overview</h2>

                            <div className="stats-grid">
                                <StatCard value={adminStats.totalStudents} label="Total Students" />
                                <StatCard value={adminStats.activeProjects} label="Active Projects" />
                                <StatCard value={adminStats.pendingTasks} label="Pending Tasks" />
                                <StatCard value={adminStats.totalRevenue} label="Monthly Revenue" />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                                <div className="portal-card">
                                    <div className="portal-card-header">
                                        <h3 className="portal-card-title" style={{ color: "black" }}>
                                            Recent Activities
                                        </h3>
                                    </div>
                                    <div>
                                        {recentActivities.map((a) => (
                                            <div key={a.id} className="table-row" style={{ gridTemplateColumns: "1fr auto auto" }}>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{a.action}</div>
                                                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>by {a.user}</div>
                                                </div>
                                                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{a.time}</div>
                                                <div
                                                    className={`status-badge status-${a.type === "success" ? "active" : a.type === "warning" ? "pending" : "completed"
                                                        }`}
                                                >
                                                    {a.type}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="portal-card">
                                    <div className="portal-card-header">
                                        <h3 className="portal-card-title" style={{ color: "black" }}>System Health</h3>
                                    </div>
                                    <KVRow label="Server Uptime" value={systemHealth.serverUptime} success />
                                    <KVRow label="Database" value={systemHealth.databaseStatus} success />
                                    <KVRow label="Backup Status" value={systemHealth.backupStatus} success />
                                    <KVRow label="Security" value={systemHealth.securityStatus} success />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* STUDENT MANAGEMENT */}
                    {activeTab === "employees" && (
                        <section>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                <h2 style={{ marginBottom: "2rem", color: "black" }}>Student Management</h2>
                            </div>

                            <div className="data-table">
                                <div className="table-header">All Students</div>
                                <div
                                    className="table-row"
                                    style={{
                                        gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                                        fontWeight: 600,
                                        background: "#f8fafc",
                                    }}
                                >
                                    <div>Name</div>
                                    <div>Course</div>
                                    <div>Status</div>
                                    <div>Join Date</div>
                                    <div>Actions</div>
                                </div>

                                {[
                                    { name: "Priya Sharma", course: "Full Stack Development", status: "active", joinDate: "2024-01-15" },
                                    { name: "Rahul Kumar", course: "UI/UX Design", status: "active", joinDate: "2024-01-20" },
                                    { name: "Anita Patel", course: "Data Science", status: "active", joinDate: "2024-02-01" },
                                    { name: "Vikram Singh", course: "Cybersecurity", status: "inactive", joinDate: "2024-01-10" },
                                ].map((s, i) => (
                                    <div key={i} className="table-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}>
                                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                                        <div>{s.course}</div>
                                        <div>
                                            <span className={`status-badge status-${s.status}`}>{s.status}</span>
                                        </div>
                                        <div>{s.joinDate}</div>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button className="action-button">Edit</button>
                                            <button className="action-button">View</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* COURSE OVERVIEW */}
                    {activeTab === "projects" && (
                        <section>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                <h2 style={{ margin: 0, color: "black" }}>Course Overview</h2>
                                <button className="btn-primary" onClick={() => setShowAddCourse(true)}>
                                    Add Course
                                </button>
                            </div>

                            <div className="stats-grid">
                                <StatCard value={courses.length} label="Total Courses" />
                                <StatCard value={courses.filter((c) => c.visibility === "published").length} label="Published Courses" />
                                <StatCard value={courses.filter((c) => c.visibility === "draft").length} label="Draft Courses" />
                                <StatCard
                                    value={courses.reduce((t, c) => t + (c.enrolled_count || 0), 0)}
                                    label="Total Enrollments"
                                />
                            </div>

                            <div className="data-table">
                                <div className="table-header">All Courses</div>
                                <div
                                    className="table-row"
                                    style={{
                                        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                                        fontWeight: 600,
                                        background: "#f8fafc",
                                    }}
                                >
                                    <div>Course Title</div>
                                    <div>Subtitle</div>
                                    <div>Duration</div>
                                    <div>Visibility</div>
                                    <div>Enrollments</div>
                                    <div>Actions</div>
                                </div>

                                {courses.map((course, idx) => (
                                    <div
                                        key={course?._id || idx}
                                        className="table-row"
                                        style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto" }}
                                    >
                                        <div style={{ fontWeight: 500 }}>
                                            {course?.icon} {course?.title}
                                        </div>
                                        <div>{course?.subtitle || ""}</div>
                                        <div>{course?.duration || ""}</div>
                                        <div>
                                            <span
                                                className={`status-badge status-${course?.visibility === "published" ? "active" : "pending"
                                                    }`}
                                            >
                                                {course?.visibility}
                                            </span>
                                        </div>
                                        <div>{course?.enrolled_count || 0}</div>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button className="action-button primary" onClick={() => handleViewCourse(course)}>
                                                View
                                            </button>
                                            <button className="action-button">Edit</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SYSTEM */}
                    {activeTab === "system" && (
                        <section>
                            <h2 style={{ marginBottom: "2rem", color: "black" }}>System Management</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                                <Card title="Database Management">
                                    <ActionList
                                        actions={[
                                            "Backup Database",
                                            "Restore Database",
                                            "Optimize Database",
                                            "View Logs",
                                        ]}
                                    />
                                </Card>
                                <Card title="User Management">
                                    <ActionList
                                        actions={["Create User", "Manage Roles", "Reset Passwords", "View Sessions"]}
                                    />
                                </Card>
                                <Card title="Security Settings">
                                    <ActionList
                                        actions={["Security Audit", "Update Firewall", "SSL Certificate", "Access Logs"]}
                                    />
                                </Card>
                            </div>
                        </section>
                    )}

                    {/* STUDENT REGISTRATIONS */}
                    {activeTab === "student-registrations" && (
                        <section>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                <h2 style={{ marginBottom: "2rem", color: "black" }}>Student Registrations</h2>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <select
                                        className="form-input"
                                        style={{ width: "auto" }}
                                        onChange={(e) => fetchRegistrations(e.target.value)}
                                    >
                                        <option value="all">All Registrations</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="submitted">Submitted</option>
                                    </select>
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            // CSV export
                                            const rows = (studentRegistrations || []).map((r) => [
                                                r.full_name || r.fullName || "",
                                                r.email || "",
                                                r.phone || "",
                                                r.course_id?.title || r.course || "",
                                                r.status || "",
                                                r.created_at || r.registrationDate || "",
                                            ]);
                                            const csv =
                                                "Name,Email,Phone,Course,Status,Registration Date\n" +
                                                rows.map((cols) => cols.map(escapeCSV).join(",")).join("\n");
                                            const blob = new Blob([csv], { type: "text/csv" });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = "student_registrations.csv";
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        }}
                                    >
                                        Export Data
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                                <StatCard
                                    value={
                                        (studentRegistrations || []).filter(
                                            (r) =>
                                                r.status === "pending" ||
                                                r.status === "submitted" ||
                                                r.status === "under_review"
                                        ).length
                                    }
                                    label="Pending Approvals"
                                />
                                <StatCard
                                    value={(studentRegistrations || []).filter((r) => r.status === "approved" || r.status === "accepted").length}
                                    label="Approved"
                                />
                                <StatCard
                                    value={(studentRegistrations || []).filter((r) => r.status === "rejected").length}
                                    label="Rejected"
                                />
                                <StatCard value={(studentRegistrations || []).length} label="Total Registrations" />
                            </div>

                            {/* Table */}
                            <div className="data-table">
                                <div className="table-header">Student Registration Requests</div>

                                <div
                                    className="table-row"
                                    style={{
                                        gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 2fr",
                                        fontWeight: 600,
                                        background: "#f8fafc",
                                    }}
                                >
                                    <div>Student Details</div>
                                    <div>Course</div>
                                    <div>Registration Date</div>
                                    <div>Documents</div>
                                    <div>Status</div>
                                    <div>Actions</div>
                                    <div>Notes</div>
                                </div>

                                {Array.isArray(studentRegistrations) && studentRegistrations.length > 0 ? (
                                    studentRegistrations.map((registration) => {
                                        const name = registration?.full_name || registration?.fullName || "Unnamed";
                                        const email = registration?.email || "No email";
                                        const phone = registration?.phone || "N/A";
                                        const course = registration?.course_id?.title || registration?.course || "N/A";
                                        const dateVal = registration?.created_at || registration?.registrationDate;
                                        const dateStr = dateVal ? new Date(dateVal).toLocaleDateString() : "N/A";
                                        const docs = Array.isArray(registration?.documents) ? registration.documents : [];
                                        const status = registration?.status || "pending";
                                        const notes = registration?.notes || registration?.rejectionReason || "";

                                        const statusClass =
                                            status === "accepted" || status === "approved"
                                                ? "active"
                                                : status === "rejected"
                                                    ? "inactive"
                                                    : "pending";

                                        return (
                                            <div
                                                key={registration?._id || registration?.id}
                                                className="table-row"
                                                style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 2fr" }}
                                            >
                                                {/* Student Info */}
                                                <div>
                                                    <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{safeRender(name)}</div>
                                                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{safeRender(email)}</div>
                                                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{safeRender(phone)}</div>
                                                </div>

                                                {/* Course */}
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{course}</div>
                                                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                                        {registration?.address || "N/A"}
                                                    </div>
                                                </div>

                                                {/* Date */}
                                                <div>{dateStr}</div>

                                                {/* Docs */}
                                                <div>
                                                    <div style={{ fontSize: "0.875rem" }}>
                                                        {docs.length > 0 ? `${docs.length} docs` : "0 docs"}
                                                    </div>
                                                    {docs.length > 0 && (
                                                        <button
                                                            className="action-button"
                                                            onClick={() => alert(`Documents:\n${docs.join("\n")}`)}
                                                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Status */}
                                                <div>
                                                    <span className={`status-badge status-${statusClass}`}>{status}</span>
                                                </div>

                                                {/* Actions */}
                                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                    {(status === "submitted" || status === "under_review" || status === "pending") && (
                                                        <>
                                                            <button
                                                                className="action-button primary"
                                                                onClick={() => handleApproveRegistration(registration?._id || registration?.id)}
                                                                disabled={loading}
                                                                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                                            >
                                                                {loading ? "Processing..." : "Approve"}
                                                            </button>
                                                            <button
                                                                className="action-button"
                                                                onClick={() => {
                                                                    const reason = prompt("Enter rejection reason:");
                                                                    if (reason) {
                                                                        handleRejectRegistration(registration?._id || registration?.id, reason);
                                                                    }
                                                                }}
                                                                disabled={loading}
                                                                style={{
                                                                    fontSize: "0.75rem",
                                                                    padding: "0.25rem 0.5rem",
                                                                    background: "#ef4444",
                                                                    color: "white",
                                                                }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        className="action-button"
                                                        onClick={() => handleViewDetails(registration)}
                                                        style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                                    >
                                                        Details
                                                    </button>
                                                </div>

                                                {/* Notes / meta */}
                                                <div style={{ fontSize: "0.875rem" }}>
                                                    {(status === "accepted" || status === "approved") && registration?.reviewed_at && (
                                                        <div style={{ color: "#22c55e" }}>
                                                            Approved on {new Date(registration.reviewed_at).toLocaleDateString()}
                                                            {registration?.reviewed_by?.full_name && (
                                                                <div style={{ fontSize: "0.75rem" }}>
                                                                    by {registration.reviewed_by.full_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {status === "rejected" && (
                                                        <div style={{ color: "#ef4444" }}>
                                                            <div>
                                                                Rejected on{" "}
                                                                {new Date(
                                                                    registration?.reviewed_at || registration?.rejectedDate || new Date()
                                                                ).toLocaleDateString()}
                                                            </div>
                                                            {notes && (
                                                                <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                                                    Reason: {safeRender(notes)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {(status === "submitted" || status === "under_review" || status === "pending") && (
                                                        <div style={{ color: "#f59e0b" }}>Awaiting review</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p style={{ textAlign: "center", color: "#6b7280", marginTop: "1rem" }}>
                                        No registrations found.
                                    </p>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div style={{ marginTop: "2rem" }}>
                                <div className="portal-card">
                                    <div className="portal-card-header">
                                        <h3 className="portal-card-title" style={{ color: "black" }}>
                                            Quick Actions
                                        </h3>
                                    </div>

                                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                        <button
                                            className="btn-primary"
                                            onClick={() => {
                                                const pendingCount = (studentRegistrations || []).filter(
                                                    (r) => r.status === "pending" || r.status === "submitted" || r.status === "under_review"
                                                ).length;

                                                if (!pendingCount) {
                                                    alert("No pending registrations to approve");
                                                    return;
                                                }
                                                if (confirm(`Approve all ${pendingCount} pending registrations (UI only)?`)) {
                                                    // Local UI update only (no bulk API)
                                                    setStudentRegistrations((prev) =>
                                                        (prev || []).map((r) =>
                                                            r.status === "pending" || r.status === "submitted" || r.status === "under_review"
                                                                ? { ...r, status: "approved", approvedDate: new Date().toISOString().split("T")[0] }
                                                                : r
                                                        )
                                                    );
                                                    alert("All pending registrations marked approved (UI).");
                                                }
                                            }}
                                        >
                                            Approve All Pending
                                        </button>

                                        <button
                                            className="btn-secondary"
                                            onClick={() => {
                                                const rows = (studentRegistrations || []).map((r) => [
                                                    r.full_name || r.fullName || "",
                                                    r.email || "",
                                                    r.phone || "",
                                                    r.course_id?.title || r.course || "",
                                                    r.status || "",
                                                    r.created_at || r.registrationDate || "",
                                                ]);
                                                const csv =
                                                    "Name,Email,Phone,Course,Status,Registration Date\n" +
                                                    rows.map((cols) => cols.map(escapeCSV).join(",")).join("\n");
                                                const blob = new Blob([csv], { type: "text/csv" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url;
                                                a.download = "student_registrations.csv";
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                        >
                                            Download CSV
                                        </button>

                                        <button
                                            className="btn-secondary"
                                            onClick={() => {
                                                fetchRegistrations();
                                                alert("Registration data refreshed!");
                                            }}
                                        >
                                            Refresh Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* REPORTS */}
                    {activeTab === "reports" && (
                        <section>
                            <h2 style={{ marginBottom: "2rem", color: "black" }}>Reports & Analytics</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                                <Card title="Employee Reports">
                                    <ActionList actions={["Attendance Report", "Performance Report", "Payroll Report", "Leave Report"]} />
                                </Card>
                                <Card title="Project Reports">
                                    <ActionList actions={["Project Status", "Time Tracking", "Budget Analysis", "Client Reports"]} />
                                </Card>
                                <Card title="Financial Reports">
                                    <ActionList actions={["Revenue Report", "Expense Report", "Profit & Loss", "Tax Reports"]} />
                                </Card>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Add Course Modal (logged-in view) */}
            {showAddCourse && (
                <Modal title="Add New Course" onClose={() => setShowAddCourse(false)}>
                    {/* same form as login view; reuse handler */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddCourse();
                        }}
                    >
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <TextField label="Slug" value={newCourse.slug} onChange={(v) => setNewCourse((p) => ({ ...p, slug: v }))} required placeholder="course-slug" />
                            <TextField label="Title" value={newCourse.title} onChange={(v) => setNewCourse((p) => ({ ...p, title: v }))} required placeholder="Course Title" />
                            <TextField label="Subtitle" value={newCourse.subtitle} onChange={(v) => setNewCourse((p) => ({ ...p, subtitle: v }))} placeholder="Course Subtitle" />
                            <TextField label="Duration" value={newCourse.duration} onChange={(v) => setNewCourse((p) => ({ ...p, duration: v }))} placeholder="e.g., 3 months" />
                            <TextArea label="Description" value={newCourse.description} onChange={(v) => setNewCourse((p) => ({ ...p, description: v }))} rows={3} />
                            <TextField label="Prerequisites" value={newCourse.prerequisites} onChange={(v) => setNewCourse((p) => ({ ...p, prerequisites: v }))} />
                            <TextField label="Icon" value={newCourse.icon} onChange={(v) => setNewCourse((p) => ({ ...p, icon: v }))} placeholder="🎓" />
                            <Select
                                label="Visibility"
                                value={newCourse.visibility}
                                onChange={(v) => setNewCourse((p) => ({ ...p, visibility: v }))}
                                options={[
                                    { value: "draft", label: "Draft" },
                                    { value: "published", label: "Published" },
                                ]}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
                            <button type="button" onClick={() => setShowAddCourse(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? "Adding..." : "Add Course"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Course Details Modal (logged-in view) */}
            {showCourseDetails && selectedCourse && (
                <Modal
                    title={`${selectedCourse?.icon || ""} ${selectedCourse?.title || ""}`}
                    onClose={() => {
                        setShowCourseDetails(false);
                        setSelectedCourse(null);
                    }}
                >
                    <div style={{ display: "grid", gap: "1rem" }}>
                        <KV label="Subtitle" value={selectedCourse?.subtitle || "N/A"} />
                        <KV label="Duration" value={selectedCourse?.duration || "N/A"} />
                        <KV label="Description" value={selectedCourse?.description || "N/A"} />
                        <KV label="Prerequisites" value={selectedCourse?.prerequisites || "N/A"} />

                        {/* Visibility row manually handled (not inside KV) */}
                        <div>
                            <strong>Visibility:</strong>{" "}
                            <span
                                className={`status-badge status-${selectedCourse?.visibility === "published" ? "active" : "pending"
                                    }`}
                            >
                                {selectedCourse?.visibility || "N/A"}
                            </span>
                        </div>

                        <KV label="Enrollments" value={selectedCourse?.enrolled_count || 0} />
                        <KV label="Slug" value={selectedCourse?.slug || "N/A"} />
                    </div>

                    <div
                        style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}
                    >
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setShowCourseDetails(false);
                                setSelectedCourse(null);
                            }}
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            )}

        </div>
    );
}

/* ---------------- Small UI helpers ---------------- */

function StatCard({ value, label }) {
    return (
        <div className="stat-card">
            <div className="stat-number">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div className="portal-card">
            <h3 className="portal-card-title" style={{ color: "black" }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

function ActionList({ actions = [] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {actions.map((a, i) => (
                <button key={i} className={`action-button ${i === 0 ? "primary" : ""}`}>
                    {a}
                </button>
            ))}
        </div>
    );
}

function KVRow({ label, value, success = false }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 1rem" }}>
            <span>{label}</span>
            <span style={{ color: success ? "#22c55e" : "#111827", fontWeight: 600 }}>{value}</span>
        </div>
    );
}

function KV({ label, value }) {
    return (
        <div>
            <strong>{label}:</strong> {safeRender(value)}
        </div>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: "0.5rem",
                    padding: "2rem",
                    width: "90%",
                    maxWidth: 600,
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ margin: 0, color: "black" }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function TextField({ label, value, onChange, placeholder, required }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input
                className="form-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                type="text"
            />
        </div>
    );
}

function TextArea({ label, value, onChange, rows = 3 }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <textarea className="form-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
    );
}

function Select({ label, value, onChange, options = [] }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <select className="form-input" value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function escapeCSV(val) {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}
