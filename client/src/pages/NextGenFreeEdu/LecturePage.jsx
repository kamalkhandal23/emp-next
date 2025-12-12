import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/api";

export default function App() {
    const [classLinks, setClassLinks] = useState([]);
    const { idU } = useParams();
    const navigate = useNavigate();

    // ---------------- SAFE DATE + TIME PARSER ---------------- //
    const parseDateTime = (date, time) => {
        if (!date || !time) return null;

        let classDate;

        // Case 1: YYYY-MM-DD
        if (date.includes("-")) {
            const [y, m, d] = date.split("-").map(Number);
            classDate = new Date(y, m - 1, d);
        }
        // Case 2: DD/MM/YYYY
        else if (date.includes("/")) {
            const [d, m, y] = date.split("/").map(Number);
            const fullYear = y < 100 ? (y < 50 ? 2000 + y : 1900 + y) : y;
            classDate = new Date(fullYear, m - 1, d);
        }

        // TIME support (07:00 OR 7:00 PM)
        if (time.includes("AM") || time.includes("PM")) {
            return new Date(`${classDate.toDateString()} ${time}`);
        }

        const [hours, minutes] = time.split(":").map(Number);
        classDate.setHours(hours, minutes);

        return classDate;
    };

    // ---------------- FETCH COURSE ---------------- //
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const raw = localStorage.getItem("studentInfo");
                const studentInfo = raw ? JSON.parse(raw) : null;

                const token = localStorage.getItem("authToken");
                if (!token) return navigate("/nextgen/login");

                const courseId = studentInfo?.course?._id;
                if (!courseId) {
                    console.log("Invalid course data");
                    setClassLinks([]);
                    return;
                }

                const response = await apiClient.getCourseById(courseId);
                const links = response?.data?.course?.classLinks || [];
                console.log(response);

                const now = new Date();

                const processed = links
                    .map((link) => {
                        const classDateTime = parseDateTime(link.date, link.time);
                        if (!classDateTime) return null;

                        const isPast = classDateTime < new Date(now.getTime() - 3 * 60 * 60 * 1000);
                        const isActive = classDateTime <= now && !isPast;
                        const isUpcoming = classDateTime > now;

                        return {
                            ...link,
                            classDateTime,
                            isPast,
                            isActive,
                            isUpcoming,
                        };
                    })
                    .filter(Boolean)

                    // ---------------- SORTING FIXED HERE ---------------- //
                    .sort((a, b) => {
                        // 1) ACTIVE on top
                        if (a.isActive && !b.isActive) return -1;
                        if (b.isActive && !a.isActive) return 1;

                        // 2) UPCOMING next
                        if (a.isUpcoming && !b.isUpcoming) return -1;
                        if (b.isUpcoming && !a.isUpcoming) return 1;

                        // 3) PAST last (descending → newest first)
                        if (a.isPast && b.isPast) return b.classDateTime - a.classDateTime;

                        // Default fallback
                        return a.classDateTime - b.classDateTime;
                    });

                setClassLinks(processed);
            } catch (err) {
                console.error("Error fetching course:", err);
                setClassLinks([]);
            }
        };

        fetchCourse();
    }, [idU, navigate]);

    // ---------------- UPDATE ACTIVITY ---------------- //
    const updateActivity = async (classLink) => {
        try {
            const raw = localStorage.getItem("studentInfo");
            const studentInfo = raw ? JSON.parse(raw) : null;

            const token = localStorage.getItem("authToken");
            if (!token) return navigate("/nextgen/login");

            const studentId =
                studentInfo?.student_id ||
                studentInfo?._id ||
                studentInfo?.id;

            const courseId = studentInfo?.course?._id;

            const response = await apiClient.post(
                `/nextgen/studentData/add-activity?studentId=${studentId}&courseId=${courseId}`,
                {
                    lectureId: classLink?._id,
                    activityType: "Joined Lecture",
                    description: `Joined lecture: ${classLink.title}`,
                }
            );

            console.log("Activity Updated:", response.data);
        } catch (err) {
            console.error("Error updating activity:", err);
        }
    };

    return (
        <div
            style={{
                padding: "40px 20px",
                maxWidth: "900px",
                margin: "auto",
                fontFamily: "Inter, sans-serif",
                color: "#0f172a",
                minHeight: "80vh",
            }}
        >
            {/* Clean Title */}
            <h1
                style={{
                    fontSize: "32px",
                    marginBottom: "25px",
                    fontWeight: 700,
                    color: "#0f172a",
                }}
            >
                📚 Class Links
            </h1>

            {/* No Class Links */}
            {classLinks.length === 0 && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "60vh",
                        textAlign: "center",
                    }}
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/7486/7486809.png"
                        alt="No classes"
                        style={{ width: "160px", marginBottom: "20px" }}
                    />
                    <h2 style={{ fontSize: "22px", fontWeight: 700 }}>
                        No Class Links Available
                    </h2>
                    <p style={{ color: "#475569", fontSize: "17px" }}>
                        Class links will appear here once scheduled.
                    </p>
                </div>
            )}

            {/* Class Links */}
            {classLinks.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {classLinks.map((classLink, index) => (
                        <div
                            key={classLink._id || index}
                            style={{
                                background: "linear-gradient(135deg, #dadeffff, #174c8dff)",
                                padding: "30px",
                                borderRadius: "18px",
                                border: "1px solid #dbeafe",
                                boxShadow: "0 8px 20px rgba(29, 21, 21, 0.06)",
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: "22px",
                                    fontWeight: 700,
                                    color: "black"
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
                                        backgroundColor: classLink.isActive
                                            ? "#10b981"
                                            : classLink.isPast
                                            ? "#6b7280"
                                            : "#f59e0b",
                                        color: "white",
                                    }}
                                >
                                    {classLink.isActive
                                        ? "LIVE"
                                        : classLink.isPast
                                        ? "PAST"
                                        : "UPCOMING"}
                                </span>
                            </p>

                            {/* JOIN BUTTON */}
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
                                        display: "inline-block",
                                    }}
                                    onClick={async (e) => {
                                        e.preventDefault();

                                        if (!classLink.videoURL) {
                                            alert("Class link not available.");
                                            return;
                                        }

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
                                        opacity: 0.6,
                                    }}
                                >
                                    ⏰ Class Not Started
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
