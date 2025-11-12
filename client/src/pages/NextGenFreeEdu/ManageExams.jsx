import React, { useState, useEffect } from "react";
import { apiClient } from "../../utils/api";

export default function ManageExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [editForm, setEditForm] = useState({
    examName: "",
    totalQuestions: 0,
    questions: {}
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllNextGenExams();
      if (response.success) {
        setExams(response.data.exams || []);
      } else {
        throw new Error(response.message || "Failed to fetch exams");
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setEditForm({
      examName: exam.examName,
      totalQuestions: exam.totalQuestions,
      questions: { ...exam.questions }
    });
    setShowEditModal(true);
  };

  const handleUpdateExam = async () => {
    try {
      setLoading(true);
      // For now, we'll just update the status or basic info
      // In a full implementation, you'd want to update the entire exam
      const response = await apiClient.updateNextGenExamStatus(editingExam._id, 'published');

      if (response.success) {
        alert("Exam updated successfully!");
        setShowEditModal(false);
        setEditingExam(null);
        fetchExams(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update exam");
      }
    } catch (err) {
      console.error("Error updating exam:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId, examName) => {
    if (!confirm(`Are you sure you want to delete the exam "${examName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.deleteNextGenExam(examId);

      if (response.success) {
        alert("Exam deleted successfully!");
        fetchExams(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to delete exam");
      }
    } catch (err) {
      console.error("Error deleting exam:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      setLoading(true);
      const response = await apiClient.updateNextGenExamStatus(examId, newStatus);

      if (response.success) {
        alert(`Exam status updated to ${newStatus}!`);
        fetchExams(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to update exam status");
      }
    } catch (err) {
      console.error("Error updating exam status:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="portal-layout">
        <div className="portal-header">
          <div className="container">
            <h1>Manage Exams</h1>
            <p>Loading exams...</p>
          </div>
        </div>
        <div className="portal-content">
          <div className="container">
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
              <p>Loading exams from database...</p>
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
            <h1>Manage Exams</h1>
            <p>Error loading exams</p>
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
          <h1>Manage Exams</h1>
          <p>View and edit exams from the ng_exams collection</p>
        </div>
      </div>

      <div className="portal-content">
        <div className="container">
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: "2rem" }}>
            <div className="stat-card">
              <div className="stat-number">{exams.length}</div>
              <div className="stat-label">Total Exams</div>
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
            <div className="table-header">All Exams</div>

            <div
              className="table-row"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                fontWeight: 600,
                background: "#f8fafc",
              }}
            >
              <div>Exam Name</div>
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
                <p>No exams found in the database.</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  Create exams using the CreateExam page to see them here.
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
              {loading ? "Refreshing..." : "Refresh Exams"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Exam Modal */}
      {showEditModal && editingExam && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
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
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, color: "black" }}>Edit Exam: {editingExam.examName}</h3>
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
                <strong>Exam Name:</strong> {editingExam.examName}
              </div>
              <div>
                <strong>Total Questions:</strong> {editingExam.totalQuestions}
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

              {/* Questions Preview */}
              <div>
                <strong>Questions:</strong>
                <div style={{ marginTop: "1rem", maxHeight: "300px", overflowY: "auto" }}>
                  {Object.entries(editingExam.questions).map(([qNum, qData]) => (
                    <div key={qNum} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                      <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
                        Question {qNum}: {qData.question}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                        Type: {qData.type}
                      </div>
                      {qData.type === 'MCQ' && qData.options && (
                        <div style={{ fontSize: "0.875rem" }}>
                          <strong>Options:</strong>
                          <ul style={{ margin: "0.25rem 0", paddingLeft: "1rem" }}>
                            {qData.options.map((option, idx) => (
                              <li key={idx}>{option}</li>
                            ))}
                          </ul>
                          <div><strong>Answer:</strong> {qData.answer}</div>
                        </div>
                      )}
                      {qData.type === 'Coding' && qData.testCase && (
                        <div style={{ fontSize: "0.875rem" }}>
                          <strong>Test Case:</strong> {qData.testCase}
                        </div>
                      )}
                      {qData.type === 'Answer-based' && qData.answer && (
                        <div style={{ fontSize: "0.875rem" }}>
                          <strong>Expected Answer:</strong> {qData.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingExam(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateExam}
                className="btn-primary"
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
