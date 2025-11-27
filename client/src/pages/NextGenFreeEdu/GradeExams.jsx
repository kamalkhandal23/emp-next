import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GradeExams() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [grading, setGrading] = useState({});

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/exams`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                setExams(data?.data?.exams || []);
            } else {
                alert("Failed to fetch exams");
            }
        } catch (error) {
            console.error("Error fetching exams:", error);
            alert("Error fetching exams");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (examId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/exams/${examId}/submissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                setSubmissions(data?.data?.submissions || []);
                setSelectedExam(data?.data?.exam || null);
            } else {
                alert("Failed to fetch submissions");
            }
        } catch (error) {
            console.error("Error fetching submissions:", error);
            alert("Error fetching submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmission = async (submissionId, grade, feedback) => {
        setGrading(prev => ({ ...prev, [submissionId]: true }));
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/nextgen/exams/grade/${submissionId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ grade: parseInt(grade), feedback }),
            });

            if (res.ok) {
                alert("Submission graded successfully!");
                // Refresh submissions
                if (selectedExam) {
                    fetchSubmissions(selectedExam.id);
                }
            } else {
                const errorData = await res.json();
                alert(`Failed to grade submission: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error grading submission:", error);
            alert("Error grading submission");
        } finally {
            setGrading(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    return (
        <div className="portal-layout">
            <div className="portal-header">
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Grade Exams</h1>
                        <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>Review and grade student submissions</p>
                    </div>
                    <button
                        onClick={() => navigate("/portal/coursemanager")}
                        className="btn-secondary"
                        style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="portal-content">
                <div className="container">
                    {!selectedExam ? (
                        <section>
                            <h2 style={{ marginBottom: "2rem", color: "black" }}>Select Exam to Grade</h2>
                            {loading ? (
                                <p>Loading exams...</p>
                            ) : exams.length > 0 ? (
                                <div className="data-table">
                                    <div className="table-header">Available Exams</div>
                                    <div
                                        className="table-row"
                                        style={{
                                            gridTemplateColumns: "2fr 1fr 1fr auto",
                                            fontWeight: 600,
                                            background: "#f8fafc",
                                        }}
                                    >
                                        <div>Exam Name</div>
                                        <div>Total Questions</div>
                                        <div>Status</div>
                                        <div>Actions</div>
                                    </div>
                                    {exams.map((exam) => (
                                        <div
                                            key={exam._id}
                                            className="table-row"
                                            style={{ gridTemplateColumns: "2fr 1fr 1fr auto" }}
                                        >
                                            <div style={{ fontWeight: 500 }}>{exam.examName}</div>
                                            <div>{exam.totalQuestions}</div>
                                            <div>
                                                <span className={`status-badge status-${exam.status === "published" ? "active" : "pending"}`}>
                                                    {exam.status}
                                                </span>
                                            </div>
                                            <div>
                                                <button
                                                    className="action-button primary"
                                                    onClick={() => fetchSubmissions(exam._id)}
                                                >
                                                    View Submissions
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No exams found.</p>
                            )}
                        </section>
                    ) : (
                        <section>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                <div>
                                    <h2 style={{ margin: 0, color: "black" }}>{selectedExam.examName}</h2>
                                    <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>Exam Grading</p>
                                </div>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setSelectedExam(null);
                                        setSubmissions([]);
                                    }}
                                >
                                    Back to Exams
                                </button>
                            </div>

                            {loading ? (
                                <p>Loading submissions...</p>
                            ) : submissions.length > 0 ? (
                                <div className="data-table">
                                    <div className="table-header">Student Submissions</div>
                                    <div
                                        className="table-row"
                                        style={{
                                            gridTemplateColumns: "2fr 1fr 2fr 1fr 1fr 1fr auto",
                                            fontWeight: 600,
                                            background: "#f8fafc",
                                        }}
                                    >
                                        <div>Student</div>
                                        <div>Submitted At</div>
                                        <div>Submission Data</div>
                                        <div>Grade</div>
                                        <div>Status</div>
                                        <div>Feedback</div>
                                        <div>Actions</div>
                                    </div>
                                    {submissions.map((submission) => (
                                        <div
                                            key={submission.id}
                                            className="table-row"
                                            style={{ gridTemplateColumns: "2fr 1fr 2fr 1fr 1fr 1fr auto" }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{submission.student ? submission.student.fullName : 'Unknown Student'}</div>
                                                {/* <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{submission.student ? submission.student.email : 'N/A'}</div> */}
                                            </div>
                                            <div>{submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'N/A'}</div>
                                            <div style={{ fontSize: "0.875rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                <button
                                                    className="action-button secondary"
                                                    onClick={() => alert(JSON.stringify(submission.submission_data, null, 2))}
                                                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                                >
                                                    View Submission
                                                </button>
                                            </div>
                                            <div>{submission.grade !== null ? submission.grade : "Not graded"}</div>
                                            <div>
                                                <span className={`status-badge status-${submission.status === "graded" ? "active" : "pending"}`}>
                                                    {submission.status}
                                                </span>
                                            </div>
                                            <div>{submission.feedback != null ? submission.feedback: "Not given" }</div>
                                            <div>
                                                <button
                                                    className="action-button primary"
                                                    onClick={() => {
                                                        const grade = prompt("Enter grade (0-100):", submission.grade || "");
                                                        if (grade !== null) {
                                                            const feedback = prompt("Enter feedback:", submission.feedback || "");
                                                            if (feedback !== null) {
                                                                handleGradeSubmission(submission.id, grade, feedback);
                                                            }
                                                        }
                                                    }}
                                                    disabled={grading[submission.id]}
                                                >
                                                    {grading[submission.id] ? "Grading..." : "Grade"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No submissions found for this exam.</p>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
