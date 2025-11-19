import React, { useState, useEffect } from "react";
import { apiClient } from "../../utils/api";

export default function ManageCodingExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [editForm, setEditForm] = useState({
    examName: "",
    totalQuestions: 0,
    questions: {}
  });

  const handleTotalQuestionsChange = (value) => {
    const newTotal = parseInt(value);
    if (isNaN(newTotal) || newTotal < 1) return;
    setEditForm({ ...editForm, totalQuestions: newTotal });
    setEditingExam({ ...editingExam, totalQuestions: newTotal });
    const currentCount = Object.keys(editForm.questions).length;
    if (newTotal > currentCount) {
      const newQuestions = { ...editForm.questions };
      for (let i = currentCount + 1; i <= newTotal; i++) {
        newQuestions[i.toString()] = { type: 'Coding', question: '', testCase: '' };
      }
      setEditForm({ ...editForm, questions: newQuestions });
    } else if (newTotal < currentCount) {
      const newQuestions = {};
      for (let i = 1; i <= newTotal; i++) {
        if (editForm.questions[i.toString()]) {
          newQuestions[i.toString()] = editForm.questions[i.toString()];
        } else {
          newQuestions[i.toString()] = { type: 'Coding', question: '', testCase: '' };
        }
      }
      setEditForm({ ...editForm, questions: newQuestions });
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionData, setQuestionData] = useState({});

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllNextGenCodingExams();
      if (response.success) {
        setExams(response.data.exams || []);
      } else {
        throw new Error(response.message || "Failed to fetch coding exams");
      }
    } catch (err) {
      console.error("Error fetching coding exams:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExam = async (exam) => {
    try {
      setLoading(true);
      // Fetch full exam data including questions
      const response = await apiClient.getNextGenCodingExamById(exam._id);
      if (response.success) {
        const fullExam = response.data;
        setEditingExam(fullExam);
        setEditForm({
          examName: fullExam.examName,
          totalQuestions: fullExam.totalQuestions,
          questions: { ...fullExam.questions }
        });
        // Initialize question data for editing
        const data = {};
        Object.entries(fullExam.questions).forEach(([qNum, qData]) => {
          data[qNum] = { ...qData };
        });
        setQuestionData(data);
        setSelectedQuestion(null);
        setShowEditModal(true);
      } else {
        throw new Error(response.message || "Failed to fetch coding exam details");
      }
    } catch (err) {
      console.error("Error fetching coding exam details:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (qNum, field, value) => {
    setQuestionData((prev) => ({
      ...prev,
      [qNum]: { ...prev[qNum], [field]: value },
    }));
  };

  const handleSaveQuestion = (qNum) => {
    alert(`Question ${qNum} saved ✅`);
    setSelectedQuestion(null);
  };

  const handleUpdateExam = async () => {
    try {
      setLoading(true);

      // Validate that exam ID exists
      if (!editingExam || !editingExam._id) {
        alert('Error: Exam ID is missing. Please refresh the page and try again.');
        return;
      }

      // Validate all questions are filled
      const allQuestionsFilled = Object.keys(questionData).every(qNum => {
        const q = questionData[qNum];
        if (!q.question || q.question.trim() === '') return false;
        if (!q.testCase || q.testCase.trim() === '') return false;
        return true;
      });

      if (!allQuestionsFilled) {
        alert('⚠️ Please fill in all question details before updating the exam.');
        return;
      }

      const examData = {
        examName: editingExam.examName,
        courseName: editingExam.courseName,
        totalQuestions: editingExam.totalQuestions,
        questionData: questionData,
        status: editingExam.status
      };

      console.log('Updating coding exam data:', examData);

      const response = await apiClient.updateNextGenCodingExam(editingExam._id, examData);

      if (response.success) {
        alert("Coding exam updated successfully!");
        setShowEditModal(false);
        setEditingExam(null);
        setSelectedQuestion(null);
        setQuestionData({});
        fetchExams(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update coding exam");
      }
    } catch (err) {
      console.error("Error updating coding exam:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this coding exam?")) return;

    try {
      setLoading(true);
      const response = await apiClient.deleteNextGenCodingExam(examId);
      if (response.success) {
        fetchExams();
      } else {
        throw new Error(response.message || "Failed to delete coding exam");
      }
    } catch (err) {
      console.error("Error deleting coding exam:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      setLoading(true);
      const response = await apiClient.updateNextGenCodingExamStatus(examId, newStatus);
      if (response.success) {
        fetchExams();
      } else {
        throw new Error(response.message || "Failed to update exam status");
      }
    } catch (err) {
      console.error("Error updating exam status:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="portal-layout">
        <div className="portal-header">
          <div className="container">
            <h1>Manage Coding Exams</h1>
            <p>Loading coding exams</p>
          </div>
        </div>
        <div className="portal-content">
          <div className="container">
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
              <p>Loading coding exams from database...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-layout">
        <div className="portal-header">
          <div className="container">
            <h1>Manage Coding Exams</h1>
            <p>Error loading coding exams</p>
          </div>
        </div>
        <div className="portal-content">
          <div className="container">
            <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
              <p><strong>Error:</strong> {error}</p>
              <button
                className="btn-primary"
                onClick={fetchExams}
                style={{ marginTop: "1rem" }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-layout">
      <div className="portal-header">
        <div className="container">
          <h1>Manage Coding Exams</h1>
          <p>View and edit coding exams</p>
        </div>
      </div>

      <div className="portal-content">
        <div className="container">
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: "2rem" }}>
            <div className="stat-card">
              <div className="stat-number">{exams.length}</div>
              <div className="stat-label">Total Coding Exams</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {exams.filter(exam => exam.status === 'published').length}
              </div>
              <div className="stat-label">Published</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {exams.filter(exam => exam.status === 'draft').length}
              </div>
              <div className="stat-label">Drafts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {exams.reduce((total, exam) => total + exam.totalQuestions, 0)}
              </div>
              <div className="stat-label">Total Questions</div>
            </div>
          </div>

          {/* Exams Table */}
          <div className="data-table">
            <div className="table-header">All Coding Exams</div>

            <div
              className="table-row"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                fontWeight: 600,
                background: "#f8fafc",
              }}
            >
              <div>Exam Name</div>
              <div>Course</div>
              <div>Questions</div>
              <div>Status</div>
              <div>Created</div>
              <div>Updated</div>
              <div>Actions</div>
            </div>

            {exams.length > 0 ? (
              exams.map((exam) => (
                <div
                  key={exam._id}
                  className="table-row"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto" }}
                >
                  <div style={{ fontWeight: 500 }}>
                    {exam.examName}
                  </div>
                  <div>{exam.courseName}</div>
                  <div>{exam.totalQuestions}</div>
                  <div>
                    <select
                      value={exam.status}
                      onChange={(e) => handleStatusChange(exam._id, e.target.value)}
                      className="form-input"
                      style={{ width: "auto", fontSize: "0.875rem" }}
                      disabled={loading}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    {new Date(exam.updatedAt).toLocaleDateString()}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="action-button primary"
                      onClick={() => handleEditExam(exam)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="action-button"
                      onClick={() => handleDeleteExam(exam._id, exam.examName)}
                      disabled={loading}
                      style={{ background: "#ef4444", color: "white" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
                <p>No coding exams found in the database.</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  Create coding exams using the CreateCodingExam page to see them here.
                </p>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <button
              className="btn-primary"
              onClick={fetchExams}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Coding Exams"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingExam && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.5rem",
              padding: "2rem",
              width: "90%",
              maxWidth: 800,
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, color: "black" }}>Edit Coding Exam: {editingExam.examName}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingExam(null);
                }}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  Exam Name:
                </label>
                <input
                  type="text"
                  value={editingExam.examName}
                  onChange={(e) => setEditingExam({ ...editingExam, examName: e.target.value })}
                  className="form-input"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  Total Questions:
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingExam.totalQuestions}
                  onChange={(e) => handleTotalQuestionsChange(e.target.value)}
                  className="form-input"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <strong>Status:</strong>
                <select
                  value={editingExam.status}
                  onChange={(e) => setEditingExam({...editingExam, status: e.target.value})}
                  className="form-input"
                  style={{ width: "auto", marginLeft: "0.5rem" }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Edit Questions */}
              <div>
                <strong>Edit Questions:</strong>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
                  Click a question number to select and edit it.
                </p>
                <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {Array.from({ length: editingExam.totalQuestions }, (_, i) => i + 1).map((num) => {
                    const isSelected = selectedQuestion === num;
                    const type = questionData[num]?.type || 'Coding';
                    return (
                      <button
                        key={num}
                        onClick={() => setSelectedQuestion(num)}
                        className={`px-3 py-1 rounded-full font-semibold border-2 transition ${
                          type
                            ? "bg-green-100 border-green-500 text-green-700 hover:bg-green-200"
                            : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
                        } ${isSelected ? "scale-105 shadow-md" : ""}`}
                      >
                        Q{num} {type && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Edit Selected Question */}
              {selectedQuestion && (
                <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem", backgroundColor: "#f9fafb" }}>
                  <h4 style={{ marginBottom: "1rem", color: "black" }}>Editing Question {selectedQuestion}</h4>

                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Enter coding question"
                      value={questionData[selectedQuestion]?.question || ""}
                      onChange={(e) =>
                        handleQuestionChange(
                          selectedQuestion,
                          "question",
                          e.target.value
                        )
                      }
                      className="border px-4 py-2 rounded"
                    />
                    <textarea
                      placeholder="Describe test case or expected logic"
                      value={
                        questionData[selectedQuestion]?.testCase || ""
                      }
                      onChange={(e) =>
                        handleQuestionChange(
                          selectedQuestion,
                          "testCase",
                          e.target.value
                        )
                      }
                      className="border px-4 py-2 rounded"
                    />
                  </div>

                  <button
                    onClick={() => handleSaveQuestion(selectedQuestion)}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
                  >
                    Save Question
                  </button>
                </div>
              )}

              {/* Questions Preview */}
              <div>
                <strong>Questions Preview:</strong>
                <div style={{ marginTop: "1rem", maxHeight: "300px", overflowY: "auto" }}>
                  {Object.entries(questionData).map(([qNum, qData]) => (
                    <div key={qNum} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                      <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
                        Question {qNum}: {qData.question}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        <strong>Test Case:</strong> {qData.testCase}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateExam}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer"
                }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
