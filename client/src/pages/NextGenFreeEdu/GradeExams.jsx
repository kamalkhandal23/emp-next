import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Helper Component for the detailed grading modal
function ExamDetailsModal({ details, onClose, onGrade, isGrading }) {
    if (!details) return null;

    const [grade, setGrade] = useState(details.submission.grade || '');
    const [feedback, setFeedback] = useState(details.submission.feedback || '');
    
    // Check if the submission is currently being graded
    const isCurrentSubmissionGrading = isGrading[details.submission.id];

    // Get question keys and sort them (q1, q2, etc.)
    const questionKeys = details.questions 
        ? Object.keys(details.questions).sort() 
        : []; 

    const handleSubmit = () => {
        // Simple validation check (Grades 0-100)
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
                        <span style={{color:'black'}}>Review Exam:</span> <span style={{ color: '#ef4444' }}>{details.examName}</span>
                    </h3>
                    <button 
                        className="btn-close" 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color:'red' }}
                    >&times;</button>
                </div>

                <h4 style={{ color: '#1f2937' }}>Student: {details.submission.student ? details.submission.student.fullName : 'Unknown'}</h4>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Submitted: {details.submission.submitted_at ? new Date(details.submission.submitted_at).toLocaleString() : 'N/A'}</p>

                <div className="questions-container" style={{ marginBottom: '2rem' }}>
                    {questionKeys.map((qKey, index) => {
                        const questionData = details.questions[qKey];
                        const studentAnswer = details.submission.submission_data[qKey];
                        
                        return (
                            <div key={qKey} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                                        Q{index + 1} ({questionData.type}): {questionData.question}
                                    </p>
                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', backgroundColor: '#e0f2f1', borderRadius: '4px', color: '#0f766e' }}>
                                        Answer Type: {questionData.type}
                                    </span>
                                </div>
                                
                                {/* Display Answer Block */}
                                <div style={{ marginTop: '0.5rem' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563', fontStyle: 'italic' }}>Student Answer:</p>
                                    <pre style={{ 
                                        backgroundColor: '#ffffff', padding: '10px', borderRadius: '4px', 
                                        whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0, 
                                        border: '1px solid #e0e0e0', maxHeight: '150px', overflowY: 'auto'
                                    }}>
                                        {studentAnswer || '*No Answer Submitted*'}
                                    </pre>
                                </div>

                                {/* Display Correct Answer/Test Case for Reference (Optional but helpful) */}
                                {questionData.type !== 'Answer-based' && ( // Exclude for simple text answers if you don't want to show the correct answer
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', borderLeft: '3px solid #3b82f6', backgroundColor: '#eff6ff' }}>
                                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#1d4ed8' }}>Model Answer / Test Case:</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                            {questionData.type === 'MCQ' ? `Correct Option: ${questionData.answer}` : questionData.testCase}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Grading Controls */}
                <div style={{ borderTop: '2px solid #ef4444', paddingTop: '1rem', marginTop: '1rem' }}>
                    <h4 style={{color:"black"}}>Grade & Feedback</h4>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '1rem' }}>
                                Grade (0-100):
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
                                Feedback:
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
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: 'sky-blue', borderColor: 'white',color: 'black', marginTop: '1rem', cursor: isCurrentSubmissionGrading ? 'not-allowed' : 'pointer' }}
                    >
                        {isCurrentSubmissionGrading ? "Saving Grade..." : "Save Grade"}
                    </button>
                </div>
            </div>
        </div>
    );
}


export default function GradeExams() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [grading, setGrading] = useState({});
    const [currentSubmissionDetails, setCurrentSubmissionDetails] = useState(null); // NEW STATE FOR MODAL

    useEffect(() => {
        fetchExams();
    }, []);

    // ... (fetchExams remains the same)
    const fetchExams = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api/nextgen/exams/my-exams`, {
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

    // ... (fetchSubmissions remains the same, but now populates selectedExam with questions)
    const fetchSubmissions = async (examId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(`https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api/nextgen/exams/${examId}/submissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                // Ensure the response data contains the exam and questions
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
            const res = await fetch(`https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api/nextgen/exams/grade/${submissionId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ grade: parseInt(grade), feedback }),
            });

            if (res.ok) {
                alert("Submission graded successfully!");
                // Refresh submissions list and close the modal
                if (selectedExam) {
                    await fetchSubmissions(selectedExam.id);
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

    // Function to set modal details
    const openSubmissionModal = (submission) => {
        if (!selectedExam || !selectedExam.questions) {
            alert("Exam questions are missing. Cannot open grading view.");
            return;
        }
        
        setCurrentSubmissionDetails({
            submission: submission,
            questions: selectedExam.questions,
            examName: selectedExam.examName
        });
    }

    return (
        <div className="portal-layout">
            <div className="portal-header">
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Grade Exams 📝</h1>
                        <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>Review and grade student exam submissions</p>
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
                                                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
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
                                    <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>Grading Submissions</p>
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
                                                    onClick={() => openSubmissionModal(submission)}
                                                    disabled={grading[submission.id]}
                                                    style={{ backgroundColor: 'sky-blue', borderColor: 'white' }}
                                                >
                                                    {grading[submission.id] ? "Loading..." : "Review/Grade"}
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
            
            {/* RENDER THE MODAL COMPONENT */}
            <ExamDetailsModal 
                details={currentSubmissionDetails}
                onClose={() => setCurrentSubmissionDetails(null)}
                onGrade={handleGradeSubmission}
                isGrading={grading}
            />
        </div>
    );
}