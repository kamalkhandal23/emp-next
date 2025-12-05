import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "@utils/api.js";

export default function AvailableLectures() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [courses, setCourses] = useState([]);
    const [viewType, setViewType] = useState("grid");
    const [openTopic, setOpenTopic] = useState(null);

    // Fetch Lectures
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
                    return;
                }

                const data = await apiClient.getNextGenLectureVideos(studentId, courseId, token);
                if (data?.courses?.length > 0) {
                    setCourses(data.courses);
                }
                console.log("Fetched Lectures:", data);
            } catch (err) {
                console.error("Error fetching lectures:", err);
            }
        };

        fetchLectures();
    }, [id]);
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

        const response = await fetch(`/api/nextgen/studentData/add-activity?studentId=${studentId}&courseId=${courseId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                activityType: 'Watched Lecture Video',
                description: `Watched a lecture video of ${lectureTitle}`,
            }),
        });

        const result = await response.json();
        console.log("Activity Updated:", result);

    } catch (err) {
        console.error("Error updating activity:", err);
    }
};



    // Group by topic
    const groupByTopic = (lectures = []) => {
        const groups = {};
        lectures.forEach(lec => {
            const topic = lec.topic?.trim() || "General";
            if (!groups[topic]) groups[topic] = [];
            groups[topic].push(lec);
        });
        return groups;
    };

    // Styles
    const styles = {
        page: {
            padding: 32,
            background: "#F9FAFB",
            minHeight: "100vh",
            fontFamily: "Inter, sans-serif",
        },
        mainHeader: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
        },
        heading: {
            fontSize: 34,
            fontWeight: 800,
            color: "#111827",
        },
        subText: {
            fontSize: 16,
            color: "#6B7280",
            marginBottom: 30,
        },
        courseTitle: {
            fontSize: 22,
            fontWeight: 700,
            marginTop: 25,
            marginBottom: 12,
            color: "#1F2937",
        },
        topicCard: {
            background: "white",
            padding: 22,
            borderRadius: 14,
            marginBottom: 15,
            border: "1px solid #E6E8EC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
        },
        arrow: { fontSize: 18, color: "#6B7280" },

        // Grid layout
        lectureGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
            marginBottom: 25,
        },

        // Card
        lectureCard: {
            padding: 20,
            borderRadius: 12,
            background: "#fff",
            border: "1px solid #E6E8EC",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "260px",
        },

        lectureTitle: {
            fontSize: 17,
            fontWeight: 600,
            marginBottom: 4,
        },
        desc: {
            fontSize: 14,
            color: "#6B7280",
            margin: "8px 0",
        },

        // Buttons
        btn: {
            marginTop: 16,
            padding: "10px 0",
            width: "100%",
            borderRadius: 8,
            background: "#2563EB",
            border: "none",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
        },
        pdfBtn: {
            marginTop: 10,
            padding: "10px 0",
            width: "100%",
            borderRadius: 8,
            background: "#10B981",
            border: "none",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
        }
    };

    // Lecture Cards
    const renderLectureCards = (lectures) => {
        if (viewType === "grid") {
            return (
                <div style={styles.lectureGrid}>
                    {lectures.map((lec) => (
                        <div key={lec._id} style={styles.lectureCard}>
                            <div style={styles.lectureTitle}>🎥 {lec.title}</div>
                            <div style={styles.desc}>📄 {lec.description}</div>

                            <button
                                style={styles.btn}
                                onClick={() => { updateActivity(lec.title); window.open(lec.videoURL, "_blank"); }}
                            >
                                ▶ Watch Video
                            </button>

                            <button
                                style={styles.pdfBtn}
                                onClick={() => window.open(lec.pdfURL, "_blank")}
                            >
                                📄 View PDF
                            </button>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div>
                {lectures.map((lec) => (
                    <div key={lec._id} style={{ ...styles.lectureCard, marginBottom: 12 }}>
                        <div style={styles.lectureTitle}>🎥 {lec.title}</div>
                        <div style={styles.desc}>📄 {lec.description}</div>

                        <button
                            style={styles.btn}
                            onClick={() => window.open(lec.videoURL, "_blank")}
                        >
                            ▶ Watch Video
                        </button>

                        <button
                            style={styles.pdfBtn}
                            onClick={() => window.open(lec.pdfURL, "_blank")}
                        >
                            📄 View PDF
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.page}>
            <div style={styles.mainHeader}>
                <span style={{ fontSize: 32 }}>📚</span>
                <h1 style={styles.heading}>Available Lectures</h1>
            </div>

            <div style={styles.subText}>Explore your course topics and watch sessions anytime.</div>

            {courses.map((course) => {
                const topics = groupByTopic(course.lectures);

                return (
                    <div key={course._id}>
                        <h2 style={styles.courseTitle}>📘 {course.title}</h2>

                        {Object.keys(topics).map((topic) => (
                            <div key={topic}>
                                <div
                                    style={styles.topicCard}
                                    onClick={() => setOpenTopic(openTopic === topic ? null : topic)}
                                >
                                    <span>🗂 {topic} ({topics[topic].length})</span>
                                    <span style={styles.arrow}>{openTopic === topic ? "▲" : "▼"}</span>
                                </div>

                                {openTopic === topic && renderLectureCards(topics[topic])}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
