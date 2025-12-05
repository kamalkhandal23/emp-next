import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/api";

export default function App() {
    const [upcomingClass, setUpcomingClass] = useState(null);
    const { idU } = useParams();
    const navigate = useNavigate();

    const demo = {
        id: "652f1c2d5e3a4b1f9a8d2c3b",
        title: "Advanced DSA",
        time: "Today 7:00 PM",
        link: "https://www.youtube.com/watch?v=xwI5OBEnsZU",
    };

    useEffect(() => {
        const fetchLectures = async () => {
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

                if (!studentId || !courseId) {
                    console.log("Invalid student or course data");
                    setUpcomingClass(null);
                    return;
                }

                const data = await apiClient.getNextGenClass(
                    studentId,
                    courseId,
                    token
                );

                // Assuming backend returns next lecture →
                if (data?.upcomingLecture) {
                    setUpcomingClass(data.upcomingLecture);
                } else {
                    setUpcomingClass(null);
                }

                console.log("Fetched Lectures:", data);
            } catch (err) {
                console.error("Error fetching lectures:", err);
                setUpcomingClass(demo); // Fallback demo
            }
        };

        fetchLectures();
    }, [idU, navigate]);

    const updateActivity = async (lectureTitle) => {
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
                        lectureId: upcomingClass?.id,
                        activityType: "Joined Lecture",
                        description: `Joined lecture: ${lectureTitle}`,
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
                📚 Class Lecture
            </h1>

            {/* No upcoming class */}
            {!upcomingClass && (
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
                        No Class Scheduled Today
                    </h2>
                    <p style={{ color: "#475569", fontSize: "17px" }}>
                        Your next lecture will appear here once scheduled.
                    </p>
                </div>
            )}

            {/* Upcoming class */}
            {upcomingClass && (
                <>
                    <h2
                        style={{
                            fontSize: "26px",
                            marginBottom: "15px",
                            fontWeight: 600,
                            color: "#0f172a",
                        }}
                    >
                        Upcoming Lecture
                    </h2>

                    <div
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
                            {upcomingClass.title}
                        </h3>

                        <p
                            style={{
                                margin: "10px 0 25px",
                                color: "#475569",
                                fontSize: "17px",
                            }}
                        >
                            🕒 {upcomingClass.time}
                        </p>

                        <a
                            href={upcomingClass.link}
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
                                await updateActivity(upcomingClass.title);
                                window.open(upcomingClass.link, "_blank");
                            }}
                        >
                            🚀 Join Class
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
