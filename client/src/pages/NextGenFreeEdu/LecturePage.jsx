import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/api";

export default function App() {
    const [classLinks, setClassLinks] = useState([]);
    const { idU } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const raw = localStorage.getItem("studentInfo");
                let studentInfo = null;

                try {
                    studentInfo = raw ? JSON.parse(raw) : null;
                } catch {
                    studentInfo = null;
                }

                const token = localStorage.getItem("authToken");
                if (!token) {
                    navigate("/nextgen/login");
                    return;
                }

                const courseId = studentInfo?.course?._id;

                if (!courseId) {
                    console.log("Invalid course data");
                    setClassLinks([]);
                    return;
                }

                const response = await apiClient.getCourseById(courseId);

                if (response?.data?.course?.classLinks) {
                    // Process and sort all class links based on current date/time
                    const now = new Date();
                    const processedLinks = response.data.course.classLinks
                        .map(link => {
                            // Parse date and time
                            const [day, month, year] = link.date.split('/').map(Number);
                            const [hours, minutes] = link.time.split(':').map(Number);

                            // Handle 2-digit or 4-digit year
                            const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
                            const classDateTime = new Date(fullYear, month - 1, day, hours, minutes);

                            const isPast = classDateTime < new Date(now.getTime() - 2 * 60 * 60 * 1000); // Past classes (more than 2 hours ago)
                            const isActive = classDateTime <= now && !isPast; // Active classes (started and within 2 hours)
                            const isUpcoming = classDateTime > now; // Upcoming classes (in the future)

                            return {
                                ...link,
                                classDateTime,
                                isPast,
                                isUpcoming,
                                isActive
                            };
                        })
                        .sort((a, b) => a.classDateTime - b.classDateTime); // Sort by date/time

                    setClassLinks(processedLinks);
                } else {
                    setClassLinks([]);
                }

                console.log("Fetched Course:", response);
            } catch (err) {
                console.error("Error fetching course:", err);
                setClassLinks([]);
            }
        };

        fetchCourse();
    }, [idU, navigate]);

    const updateActivity = async (classLink) => {
        try {
            const raw = localStorage.getItem("studentInfo");
            let studentInfo = null;

            try {
                studentInfo = raw ? JSON.parse(raw) : null;
            } catch {
                studentInfo = null;
            }

            const token = localStorage.getItem("authToken");
            if (!token) {
                navigate("/nextgen/login");
                return;
            }

            const studentId = studentInfo?.student_id ?? studentInfo?.id;
            const courseId = studentInfo?.course?._id;

            const response = await fetch(
                `/api/nextgen/studentData/add-activity?studentId=${studentId}&courseId=${courseId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        lectureId: classLink?._id,
                        activityType: "Joined Lecture",
                        description: `Joined lecture: ${classLink.title}`,
                    }),
                }
            );

            const result = await response.json();
            console.log("Activity Updated:", result);
        } catch (err) {
            console.error("Error updating activity:", err);
        }
    };

    return (
        <div
            style={{
                padding: "100px",
                maxWidth: "900px",
                margin: "auto",
                fontFamily: "Inter, sans-serif",
                color: "#0f172a",
                minHeight: "80vh",
                position: "relative",
            }}
        >
            {/* Title aligned properly */}
            <h1
                style={{
                    fontSize: "34px",
                    marginBottom: "30px",
                    fontWeight: 700,
                    color: "#0f172a",
                    position: "absolute",
                    top: "5%",
                    left: "5%",
                    transform: "translateX(-50%)",
                }}
            >
                📚 Class Links
            </h1>

            {/* No class links */}
            {classLinks.length === 0 && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "60vh",
                        textAlign: "center",
                        opacity: 0.9,
                    }}
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/7486/7486809.png"
                        alt="No classes"
                        style={{
                            width: "180px",
                            marginBottom: "20px",
                            opacity: 0.9,
                        }}
                    />
                    <h2
                        style={{
                            fontSize: "24px",
                            fontWeight: 700,
                            marginBottom: "10px",
                            color: "#0f172a",
                        }}
                    >
                        No Class Links Available
                    </h2>
                    <p style={{ color: "#475569", fontSize: "17px" }}>
                        Class links will appear here once scheduled.
                    </p>
                </div>
            )}

            {/* Class links list */}
            {classLinks.length > 0 && (
                <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {classLinks.map((classLink, index) => (
                            <div
                                key={classLink._id || index}
                                style={{
                                    background:
                                        "linear-gradient(135deg, #e3f1ff, #f5faff)",
                                    padding: "35px",
                                    borderRadius: "18px",
                                    border: "1px solid #dbeafe",
                                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: "24px",
                                        fontWeight: 700,
                                        color: "#0f172a",
                                    }}
                                >
                                    {classLink.title}
                                </h3>

                                <p
                                    style={{
                                        margin: "10px 0 15px",
                                        color: "#475569",
                                        fontSize: "17px",
                                    }}
                                >
                                    📅 {classLink.date} 🕒 {classLink.time}
                                    <span
                                        style={{
                                            marginLeft: "10px",
                                            padding: "4px 8px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            backgroundColor: classLink.isActive ? "#10b981" : classLink.isPast ? "#6b7280" : "#f59e0b",
                                            color: "white",
                                        }}
                                    >
                                        {classLink.isActive ? "LIVE" : classLink.isPast ? "PAST" : "UPCOMING"}
                                    </span>
                                </p>

                                {classLink.isActive ? (
                                    <a
                                        href={classLink.videoURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: "14px 26px",
                                            background: "#2563eb",
                                            color: "white",
                                            borderRadius: "10px",
                                            textDecoration: "none",
                                            fontWeight: 600,
                                            fontSize: "16px",
                                            boxShadow:
                                                "0 4px 12px rgba(37, 99, 235, 0.4)",
                                            transition: "0.25s",
                                        }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            await updateActivity(classLink);
                                            window.open(classLink.videoURL, "_blank");
                                        }}
                                    >
                                        🚀 Join Class
                                    </a>
                                ) : classLink.isPast ? (
                                    <button
                                        disabled
                                        style={{
                                            padding: "14px 26px",
                                            background: "#6b7280",
                                            color: "white",
                                            borderRadius: "10px",
                                            border: "none",
                                            fontWeight: 600,
                                            fontSize: "16px",
                                            cursor: "not-allowed",
                                            opacity: 0.6,
                                        }}
                                    >
                                        📚 Class Ended
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        style={{
                                            padding: "14px 26px",
                                            background: "#9ca3af",
                                            color: "white",
                                            borderRadius: "10px",
                                            border: "none",
                                            fontWeight: 600,
                                            fontSize: "16px",
                                            cursor: "not-allowed",
                                            opacity: 0.6,
                                        }}
                                    >
                                        ⏰ Class Not Started
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
