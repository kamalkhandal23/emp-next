// javascript
import React, { useEffect, useState } from "react";
import "../../components/cssComonents/leaderBoard.css";
import ApiClient from "../../utils/api";

export default function Leaderboard() {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const pageSize = 7;

    // Demo fallback
    const demoStudents = Array.from({ length: 30 }).map((_, i) => ({
        id: i + 1,
        name: `Student ${i + 1}`,
        score: Math.floor(Math.random() * 900) + 100,
    }));

    // Fetch API (fixed: parse localStorage and normalize API response)
    useEffect(() => {
        async function loadData() {
            try {
                const raw = localStorage.getItem("studentInfo");
                let studentInfo = null;
                try {
                    studentInfo = raw ? JSON.parse(raw) : null;
                } catch (err) {
                    console.warn("Failed to parse studentInfo from localStorage", err);
                    studentInfo = null;
                }
                const studentId = studentInfo?.student_id ?? studentInfo?.id ?? null;
                console.log("studentInfo:", studentInfo);

                const apiRes = await ApiClient.getNextGenLeaderboard(studentId);

                // If ApiClient returns a fetch Response, parse JSON; otherwise use as-is
                const resJson = apiRes && typeof apiRes.json === "function"
                    ? await apiRes.json()
                    : apiRes;

                console.log("api response (normalized):", resJson);

                // Normalize possible shapes: { players: [...] }, { students: [...] }, or direct array
                let dataArray = resJson?.players[0] ?? resJson?.students ?? resJson;

                // If still an object, try to extract common nested fields
                if (dataArray && !Array.isArray(dataArray) && typeof dataArray === "object") {
                    dataArray = dataArray.data ?? dataArray.players ?? dataArray.students ?? null;
                }

                if (!Array.isArray(dataArray) || dataArray.length === 0) {
                    throw new Error("No players array in API response");
                }

                setStudents(dataArray);
            } catch (e) {
                console.error("Failed to load leaderboard:", e);
                setStudents(demoStudents); // Fallback
            }
        }
        loadData();
    }, []);

    // Sort highest score → lowest
    const sorted = [...students].sort((a, b) => b.score - a.score);

    const topThree = sorted.slice(0, 3);
    const others = sorted.slice(3);

    // Pagination for the rest
    const totalPages = Math.max(1, Math.ceil(others.length / pageSize));
    const paginated = others.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div style={{ padding: "40px 20px", maxWidth: "980px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: 30, color: "#10243a" }}>
                🏆 Leaderboard
            </h1>

            {/* ---------------- TOP 3 PODIUM ---------------- */}
            <div
                className="podiumWrap"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "40px",
                    marginBottom: "60px",
                }}
            >
                {/* 2nd Place */}
                {topThree[1] && (
                    <div className="podiumItem podium-second">
                        <div className="medal medal-silver">2</div>
                        <div className="podCard card-silver">
                            <div className="rankText">2nd Place</div>
                            <div className="pName">{topThree[1].name}</div>
                            <div className="pScore">{topThree[1].score} pts</div>
                        </div>
                        <div className="podBase base-silver"></div>
                    </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                    <div className="podiumItem podium-first">
                        <div className="medal medal-gold">1</div>
                        <div className="podCard card-gold">
                            <div className="rankText">1st Place</div>
                            <div className="pName">{topThree[0].name}</div>
                            <div className="pScore">{topThree[0].score} pts</div>
                        </div>
                        <div className="podBase base-gold"></div>
                    </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                    <div className="podiumItem podium-third">
                        <div className="medal medal-bronze">3</div>
                        <div className="podCard card-bronze">
                            <div className="rankText">3rd Place</div>
                            <div className="pName">{topThree[2].name}</div>
                            <div className="pScore">{topThree[2].score} pts</div>
                        </div>
                        <div className="podBase base-bronze"></div>
                    </div>
                )}
            </div>

            {/* ---------------- LIST ITEMS ---------------- */}
            <div>
                {paginated.map((student, index) => (
                    <div
                        key={student.id}
                        className="listItem animated-list"
                        style={{ animationDelay: `${index * 90}ms` }}
                    >
                        <div className="circle">{index + 4 + (page - 1) * pageSize}</div>

                        <div style={{ flexGrow: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>{student.name}</div>
                            <div style={{ opacity: 0.7 }}>{student.score} pts</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ---------------- PAGINATION ---------------- */}
            <div style={{ textAlign: "center", marginTop: 30 }}>
                <button
                    className="pageButton"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                    ‹
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        className={`pageButton ${page === i + 1 ? "activePage" : ""}`}
                        onClick={() => setPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    className="pageButton"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                    ›
                </button>
            </div>
        </div>
    );
}
