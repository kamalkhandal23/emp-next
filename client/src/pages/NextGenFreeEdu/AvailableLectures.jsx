import { useNavigate,useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from '@utils/api.js';

export default function AvailableLectures() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [courses, setCourses] = useState([]);
    const [viewType, setViewType] = useState("grid");
    const [openTopic, setOpenTopic] = useState(null);

    const getStudentData = () => {
        const studentInfo = localStorage.getItem("studentInfo");
        return studentInfo ? JSON.parse(studentInfo) : null;
    };
    // Fetch Lectures
    useEffect(() => {
        const fetchLectures = async () => {
            try {const raw = localStorage.getItem("studentInfo");
                let studentInfo = null;
                try {
                    studentInfo = raw ? JSON.parse(raw) : null;
                } catch (err) {
                    console.warn("Failed to parse studentInfo from localStorage", err);
                    studentInfo = null;
                }

                //Checking token existence
                const token = localStorage.getItem('authToken');
                if (!token ) {
                    console.warn('⚠️ Redirecting to login - missing token or studentInfo');
                    navigate('/nextgen/login');
                    return;
                }

                const studentId = studentInfo?.student_id ?? studentInfo?.id;
                const courseId = studentInfo?.course?._id;
                console.log("Fetching lectures for student:", studentId, "course:", courseId, token);

                const data = await apiClient.getNextGenLectureVideos(studentId,courseId,token);
                console.log("Fetched lecture data:", data);

                if (data?.courses?.length > 0) {
                    setCourses(data.courses);
                } else {
                    throw new Error("No courses found for the student");
                }
            } catch (err) {
                console.error("Error fetching lectures:", err);
            }
        };

        fetchLectures();
    }, [id]);

    // Group Lectures by Topic
    const groupByTopic = (lectures = []) => {
        const groups = {};
        lectures.forEach(lec => {
            if (!groups[lec.topic]) groups[lec.topic] = [];
            groups[lec.topic].push(lec);
        });
        return groups;
    };

    // Styles (UPGRADED + MORE BEAUTIFUL)
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
            display: "flex",
            alignItems: "center",
            gap: 10,
        },

        topicCard: {
            background: "linear-gradient(to right, #ffffff, #f8fbff)",
            padding: 18,
            borderRadius: 12,
            marginBottom: 12,
            border: "1px solid #E6E8EC",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "0.2s",
        },

        topicCardHover: {
            boxShadow: "0 3px 10px rgba(0,0,0,0.09)",
        },

        topicTitle: {
            fontSize: 17,
            fontWeight: 600,
            color: "#111827",
            display: "flex",
            alignItems: "center",
            gap: 10,
        },

        arrow: {
            fontSize: 18,
            color: "#6B7280",
        },

        lectureGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
            marginBottom: 25,
        },

        lectureCard: {
            padding: 20,
            borderRadius: 12,
            background: "#ffffff",
            border: "1px solid #E6E8EC",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            transition: "0.25s",
        },

        lectureCardHover: {
            transform: "scale(1.02)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },

        lectureTitle: {
            fontSize: 17,
            fontWeight: 600,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
        },

        desc: {
            fontSize: 14,
            color: "#6B7280",
            margin: "8px 0",
        },

        duration: {
            color: "#2563EB",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
        },

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
            transition: "0.3s",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
        },
    };

    // Render Lecture Cards
    const renderLectureCards = (lectures) => {
        if (viewType === "grid") {
            return (
                <div style={styles.lectureGrid}>
                    {lectures.map((lec) => (
                        <div
                            key={lec._id}
                            style={styles.lectureCard}
                            onMouseEnter={(e) =>
                                Object.assign(e.currentTarget.style, styles.lectureCardHover)
                            }
                            onMouseLeave={(e) =>
                                Object.assign(e.currentTarget.style, styles.lectureCard)
                            }
                        >
                            <div style={styles.lectureTitle}>
                                🎥 {lec.title}
                            </div>

                            <div style={styles.desc}>
                                📄 {lec.description}
                            </div>

                            <div style={styles.duration}>⏱ {lec.duration}</div>

                            <button
                                style={styles.btn}
                                onClick={() => window.open(lec.videoUrl, "_blank")}
                            >
                                ▶ Watch Video
                            </button>
                        </div>
                    ))}
                </div>
            );
        }

        // List View
        return (
            <div>
                {lectures.map((lec) => (
                    <div
                        key={lec._id}
                        style={{ ...styles.lectureCard, marginBottom: 12 }}
                    >
                        <div style={styles.lectureTitle}>🎥 {lec.title}</div>
                        <div style={styles.desc}>📄 {lec.description}</div>
                        <div style={styles.duration}>⏱ {lec.duration}</div>

                        <button
                            style={{ ...styles.btn, marginTop: 10 }}
                            onClick={() => window.open(lec.videoUrl, "_blank")}
                        >
                            ▶ Watch
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.page}>

            {/* Header */}
            <div style={styles.mainHeader}>
                <span style={{ fontSize: 32 }}>📚</span>
                <h1 style={styles.heading}>Available Lectures</h1>
            </div>

            <div style={styles.subText}>
                Explore your course topics and watch recorded sessions anytime.
            </div>

            {/* COURSES */}
            {courses.map(course => {
                const topics = groupByTopic(course.lectures);

                return (
                    <div key={course._id}>
                        <h2 style={styles.courseTitle}>📘 {course.title}</h2>

                        {Object.keys(topics).map(topic => (
                            <div key={topic}>
                                <div
                                    style={styles.topicCard}
                                    onClick={() =>
                                        setOpenTopic(openTopic === topic ? null : topic)
                                    }
                                >
                                    <span style={styles.topicTitle}>
                                        🗂 {topic} ({topics[topic].length})
                                    </span>

                                    <span style={styles.arrow}>
                                        {openTopic === topic ? "▲" : "▼"}
                                    </span>
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
