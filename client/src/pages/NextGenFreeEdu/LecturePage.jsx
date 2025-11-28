import { useState } from "react";

export default function App() {
    const [openId, setOpenId] = useState(null);

    const upcomingClass = {
        title: "Advanced DSA",
        time: "Today 7:00 PM",
        link: "https://www.youtube.com/watch?v=xwI5OBEnsZU"
    };

    const previousClasses = [
        { id: 1, title: "Introduction to Backend Architecture", date: "28 Nov", video: "#", notes: "https://www.tutorialspoint.com/nodejs/nodejs_tutorial.pdf" },
        { id: 2, title: "Node.js Event Loop Deep Dive", date: "27 Nov", video: "#", notes: "https://www.tutorialspoint.com/nodejs/nodejs_tutorial.pdf" },
        { id: 3, title: "Building Your First Express App", date: "26 Nov", video: "#", notes: "https://www.tutorialspoint.com/nodejs/nodejs_tutorial.pdf" },
        { id: 4, title: "MongoDB CRUD Operations", date: "25 Nov", video: "#", notes: "#" },
        { id: 5, title: "JWT Authentication & Role-Based Access", date: "24 Nov", video: "#", notes: "#" },
        { id: 6, title: "API Security & Best Practices", date: "23 Nov", video: "#", notes: "#" }
    ];

    return (
        <div
            style={{
                padding: "50px",
                maxWidth: "1000px",
                margin: "auto",
                fontFamily: "Inter, sans-serif",
                color: "#0f172a" // GLOBAL TEXT FIX
            }}
        >
            {/* Heading */}
            <h1
                style={{
                    fontSize: "34px",
                    marginBottom: "20px",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    color: "#0f172a"
                }}
            >
                📚 Your Classes
            </h1>

            {/* UPCOMING / ONGOING */}
            <h2
                style={{
                    fontSize: "26px",
                    margin: "10px 0",
                    fontWeight: 600,
                    color: "#0f172a"
                }}
            >
                Upcoming / Ongoing Class
            </h2>

            <div
                style={{
                    background: "linear-gradient(135deg, #e3f1ff, #f5faff)",
                    padding: "35px",
                    borderRadius: "18px",
                    marginBottom: "45px",
                    border: "1px solid #dbeafe",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#0f172a"
                    }}
                >
                    {upcomingClass.title}
                </h3>

                <p
                    style={{
                        margin: "8px 0 25px 0",
                        color: "#334155",
                        fontSize: "17px"
                    }}
                >
                    🕒 {upcomingClass.time}
                </p>

                <a
                    href={upcomingClass.link}
                    style={{
                        padding: "14px 26px",
                        background: "#2563eb",
                        color: "white",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "16px",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                        transition: "0.2s"
                    }}
                    onMouseOver={(e) => (e.target.style.transform = "scale(1.03)")}
                    onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                >
                    🚀 Join Class
                </a>
            </div>

            {/* PREVIOUS CLASSES */}
            <h2
                style={{
                    fontSize: "26px",
                    marginBottom: "20px",
                    fontWeight: 600,
                    color: "#0f172a"
                }}
            >
                Previous Classes
            </h2>

            {previousClasses.map((cls) => (
                <div
                    key={cls.id}
                    style={{
                        background: "white",
                        padding: "22px",
                        borderRadius: "16px",
                        marginBottom: "18px",
                        border: "1px solid #eeeeee",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                        transition: "0.25s",
                        cursor: "pointer",
                        color: "#0f172a"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                        onClick={() => setOpenId(openId === cls.id ? null : cls.id)}
                    >
                        <div>
                            <h4
                                style={{
                                    margin: 0,
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    color: "#0f172a"
                                }}
                            >
                                {cls.title}
                            </h4>
                            <p
                                style={{
                                    margin: "2px 0",
                                    color: "#475569",
                                    fontSize: "15px"
                                }}
                            >
                                📅 {cls.date}
                            </p>
                        </div>

                        <span
                            style={{
                                fontSize: "26px",
                                fontWeight: 700,
                                userSelect: "none",
                                transition: "0.25s",
                                color: "#0f172a"
                            }}
                        >
                            {openId === cls.id ? "▾" : "▸"}
                        </span>
                    </div>

                    {/* Dropdown */}
                    {openId === cls.id && (
                        <div
                            style={{
                                marginTop: "18px",
                                borderTop: "1px solid #e5e7eb",
                                paddingTop: "16px",
                                animation: "fadeIn 0.3s",
                                color: "#0f172a"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <a
                                    href={cls.video}
                                    style={{
                                        color: "#2563eb",
                                        textDecoration: "none",
                                        fontSize: "16px",
                                        fontWeight: 500
                                    }}
                                >
                                    🎬 Watch Class Video
                                </a>

                                <a
                                    href={cls.notes}
                                    style={{
                                        color: "#10b981",
                                        textDecoration: "none",
                                        fontSize: "16px",
                                        fontWeight: 600
                                    }}
                                >
                                    📄 Notes →
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
