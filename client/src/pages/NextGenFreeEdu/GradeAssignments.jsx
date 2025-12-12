import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Helper Component for the detailed grading modal
function SubmissionDetailsModal({ details, onClose, onGrade, isGrading, assignmentId }) {
    if (!details) return null;

    const [grade, setGrade] = useState(details.submission.grade || '');
    const [feedback, setFeedback] = useState(details.submission.feedback || '');
    
    // Check if the submission is currently being graded (to disable button)
    const isCurrentSubmissionGrading = isGrading[details.submission.id];

    const questionKeys = Object.keys(details.questions).sort(); // Sort keys (q1, q2, etc.)

    const handleSubmit = () => {
        // Simple validation check
        const parsedGrade = parseInt(grade);
        if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100) {
            alert("Please enter a valid grade between 0 and 100.");
            return;
        }

        onGrade(details.submission.id, grade, feedback);
        // Do not close the modal immediately; let the parent component handle state refresh and closure if successful.
    };

    return (
        <div className="modal-backdrop" style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
            display: 'flex', justifyContent: 'center', alignItems: 'center' 
        }}>
            <div className="modal-content" style={{ 
                backgroundColor: 'white', padding: '2rem', 
                borderRadius: '8px', width: '90%', maxWidth: '900px', 
                maxHeight: '90vh', overflowY: 'auto' 
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>
                        Review Submission: <span style={{ color: '#3b82f6' }}>{details.submission.student ? details.submission.student.fullName : 'Unknown Student'}</span>
                    </h3>
                    <button 
                        className="btn-close" 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                    >&times;</button>
                </div>

                <div className="questions-container" style={{ marginBottom: '2rem' }}>
                    {questionKeys.map((qKey, index) => (
                        <div key={qKey} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                            <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                                Q{index + 1}. {details.questions[qKey].question}
                            </p>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563', fontStyle: 'italic' }}>Student Answer:</p>
                            <pre style={{ 
                                backgroundColor: '#ffffff', padding: '10px', borderRadius: '4px', 
                                whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0, 
                                border: '1px solid #e0e0e0'
                            }}>
                                {details.submission.submission_data[qKey] || '*No Answer Submitted*'}
                            </pre>
                        </div>
                    ))}
                </div>
                
                {/* Grading Controls */}
                <div style={{ borderTop: '2px solid #3b82f6', paddingTop: '1rem', marginTop: '1rem' }}>
                    <h4>Current Grade & Feedback</h4>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '1rem' }}>
                                **Grade (0-100):**
                                <input 
                                    type="number" 
                                    value={grade} 
                                    onChange={(e) => setGrade(e.target.value)} 
                                    min="0" 
                                    max="100"
                                    style={{ 
                                        marginLeft: '0.5rem', padding: '0.5rem', width: '100px', 
                                        border: '1px solid #ccc', borderRadius: '4px' 
                                    }}
                                />
                            </label>
                        </div>
                        <div style={{ flex: 3 }}>
                            <label style={{ display: 'block', marginBottom: '1rem' }}>
                                **Feedback:**
                                <textarea 
                                    value={feedback} 
                                    onChange={(e) => setFeedback(e.target.value)} 
                                    rows="4" 
                                    style={{ 
                                        width: '100%', padding: '0.5rem', border: '1px solid #ccc', 
                                        marginTop: '0.5rem', borderRadius: '4px' 
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                    <button 
                        className="btn-primary" 
                        onClick={handleSubmit} 
                        disabled={isCurrentSubmissionGrading}
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        {isCurrentSubmissionGrading ? "Saving Grade..." : "Save Grade and Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}


export default function GradeAssignments() {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [grading, setGrading] = useState({}); // Tracks submission IDs being graded
    const [currentSubmissionDetails, setCurrentSubmissionDetails] = useState(null); // New state for modal

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            // NOTE: Check this URL, it seems to have double slashes '//'
            const res = await fetch(`http://localhost:5002/api/nextgen/assignments/my-assignments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                setAssignments(data?.data?.assignments || []);
            } else {
                alert("Failed to fetch assignments");
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
            alert("Error fetching assignments");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`http://localhost:5002/api/nextgen/assignments/${assignmentId}/submissions`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                // Ensure assignment contains the questions field from the backend fix
                setSelectedAssignment(data?.data?.assignment || null); 
                setSubmissions(data?.data?.submissions || []);
                
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
            // NOTE: Assuming VITE_API_URL is configured correctly.
            const res = await fetch(`http://localhost:5002/api/nextgen/assignments/${submissionId}/grade`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ grade: parseInt(grade), feedback }),
            });

            if (res.ok) {
                alert("Submission graded successfully!");
                // Refresh submissions list to show the new grade/status
                if (selectedAssignment) {
                    await fetchSubmissions(selectedAssignment.id);
                    setCurrentSubmissionDetails(null); // Close modal on success
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
                        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Grade Assignments</h1>
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
                    {!selectedAssignment ? (
                        <section>
                            <h2 style={{ marginBottom: "2rem", color: "black" }}>Select Assignment to Grade</h2>
                            {loading ? (
                                <p>Loading assignments...</p>
                            ) : assignments.length > 0 ? (
                                <div className="data-table">
                                    <div className="table-header">Available Assignments</div>
                                    <div
                                        className="table-row"
                                        style={{
                                            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                                            fontWeight: 600,
                                            background: "#f8fafc",
                                        }}
                                    >
                                        <div>Assignment Name</div>
                                        <div>Course</div>
                                        <div>Total Questions</div>
                                        <div>Status</div>
                                        <div>Actions</div>
                                    </div>
                                    {assignments.map((assignment) => (
                                        <div
                                            key={assignment._id}
                                            className="table-row"
                                            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}
                                        >
                                            <div style={{ fontWeight: 500 }}>{assignment.assignmentName}</div>
                                            <div>{assignment.courseName}</div>
                                            <div>{assignment.totalQuestions}</div>
                                            <div>
                                                <span className={`status-badge status-${assignment.status === "published" ? "active" : "pending"}`}>
                                                    {assignment.status}
                                                </span>
                                            </div>
                                            <div>
                                                <button
                                                    className="action-button primary"
                                                    onClick={() => fetchSubmissions(assignment._id)}
                                                >
                                                    View Submissions
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No assignments found.</p>
                            )}
                        </section>
                    ) : (
                        <section>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                <div>
                                    <h2 style={{ margin: 0, color: "black" }}>{selectedAssignment.assignmentName}</h2>
                                    <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>Course: {selectedAssignment.courseName}</p>
                                </div>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setSelectedAssignment(null);
                                        setSubmissions([]);
                                    }}
                                >
                                    Back to Assignments
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
                                            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", // Simplified grid layout
                                            fontWeight: 600,
                                            background: "#f8fafc",
                                        }}
                                    >
                                        <div>Student</div>
                                        <div>Submitted At</div>
                                        <div>Grade</div>
                                        <div>Status</div>
                                        <div>Feedback</div>
                                        <div>Actions</div>
                                    </div>
                                    {submissions.map((submission) => (
                                        <div
                                            key={submission.id}
                                            className="table-row"
                                            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto" }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{submission.student ? submission.student.fullName : 'Unknown Student'}</div>
                                                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{submission.student ? submission.student.email : 'N/A'}</div>
                                            </div>
                                            <div>{submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'N/A'}</div>
                                            <div>{submission.grade !== null ? submission.grade : "N/A"}</div>
                                            <div>
                                                <span className={`status-badge status-${submission.status === "graded" ? "active" : "pending"}`}>
                                                    {submission.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "0.875rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {submission.feedback || 'No feedback yet'}
                                            </div>
                                            <div>
                                                <button
                                                    className="action-button primary"
                                                    onClick={() => setCurrentSubmissionDetails({
                                                        submission: submission,
                                                        questions: selectedAssignment.questions
                                                    })}
                                                    disabled={grading[submission.id]}
                                                >
                                                    {grading[submission.id] ? "Loading..." : "Review/Grade"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No submissions found for this assignment.</p>
                            )}
                        </section>
                    )}
                </div>
            </div>
            
            {/* RENDER THE MODAL COMPONENT */}
            <SubmissionDetailsModal 
                details={currentSubmissionDetails}
                onClose={() => setCurrentSubmissionDetails(null)}
                onGrade={handleGradeSubmission}
                isGrading={grading}
            />
        </div>
    );
}