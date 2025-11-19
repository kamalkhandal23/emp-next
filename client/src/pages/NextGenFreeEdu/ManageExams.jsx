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

  const handleTotalQuestionsChange = (value) => {
    const newTotal = parseInt(value);
    if (isNaN(newTotal) || newTotal < 1) return;
    setEditForm({ ...editForm, totalQuestions: newTotal });
    setEditingExam({ ...editingExam, totalQuestions: newTotal });
    const currentCount = Object.keys(questionData).length;
    if (newTotal > currentCount) {
      const newQuestionData = { ...questionData };
      for (let i = currentCount + 1; i <= newTotal; i++) {
        newQuestionData[i.toString()] = { type: '', question: '', options: [], answer: '', testCase: '' };
      }
      setQuestionData(newQuestionData);
    } else if (newTotal < currentCount) {
      const newQuestionData = {};
      for (let i = 1; i <= newTotal; i++) {
        if (questionData[i.toString()]) {
          newQuestionData[i.toString()] = questionData[i.toString()];
        } else {
          newQuestionData[i.toString()] = { type: '', question: '', options: [], answer: '', testCase: '' };
        }
      }
      setQuestionData(newQuestionData);
    }
    // Update questionTypes
    setQuestionTypes((prev) => {
      const newTypes = {};
      for (let i = 1; i <= newTotal; i++) {
        newTypes[i.toString()] = prev[i.toString()] || '';
      }
      return newTypes;
    });
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionTypes, setQuestionTypes] = useState({});
  const [questionData, setQuestionData] = useState({});

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

  const handleEditExam = async (exam) => {
    try {
      setLoading(true);
      // Fetch full exam data including questions
      const response = await apiClient.getNextGenExamById(exam._id);
      if (response.success) {
        const fullExam = response.data;
        setEditingExam(fullExam);
        setEditForm({
          examName: fullExam.examName,
          totalQuestions: fullExam.totalQuestions,
          questions: { ...fullExam.questions }
        });
        // Initialize question types and data for editing
        const types = {};
        const data = {};
        Object.entries(fullExam.questions).forEach(([qNum, qData]) => {
          types[qNum] = qData.type;
          data[qNum] = { ...qData };
        });
        setQuestionTypes(types);
        setQuestionData(data);
        setSelectedQuestion(null);
        setShowEditModal(true);
      } else {
        throw new Error(response.message || "Failed to fetch exam details");
      }
    } catch (err) {
      console.error("Error fetching exam details:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (qNum, type) => {
    setQuestionTypes((prev) => ({ ...prev, [qNum]: type }));
    setQuestionData((prev) => ({
      ...prev,
      [qNum]: prev[qNum] || { type, question: "", options: [], answer: "" },
    }));
  };

  const handleQuestionChange = (qNum, field, value) => {
    setQuestionData((prev) => ({
      ...prev,
      [qNum]: { ...prev[qNum], [field]: value },
    }));
  };

  const handleOptionChange = (qNum, index, value) => {
    setQuestionData((prev) => {
      const updatedOptions = [...(prev[qNum]?.options || [])];
      updatedOptions[index] = value;
      return { ...prev, [qNum]: { ...prev[qNum], options: updatedOptions } };
    });
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
        if (!q.type) return false;
        if (!q.question || q.question.trim() === '') return false;

        if (q.type === 'MCQ') {
          return q.options && q.options.length === 4 &&
                 q.options.every(opt => opt && opt.trim() !== '') &&
                 q.answer && q.answer.trim() !== '';
        }

        if (q.type === 'Coding') {
          return q.testCase && q.testCase.trim() !== '';
        }

        if (q.type === 'Answer-based') {
          return q.answer && q.answer.trim() !== '';
        }

        return true;
      });

      if (!allQuestionsFilled) {
        alert('⚠️ Please fill in all question details before updating the exam.');
        return;
      }

      const examData = {
        examName: editingExam.examName,
        totalQuestions: editingExam.totalQuestions,
        questionData: questionData,
        status: editingExam.status
      };

      console.log('Updating exam data:', examData);

      const response = await apiClient.updateNextGenExam(editingExam._id, examData);

      if (response.success) {
        alert("Exam updated successfully!");
        setShowEditModal(false);
        setEditingExam(null);
        setSelectedQuestion(null);
        setQuestionTypes({});
        setQuestionData({});
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
                    const type = questionTypes[num];
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

                  {!questionTypes[selectedQuestion] ? (
                    <div className="flex gap-4">
                      {["MCQ", "Coding", "Answer-based"].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleTypeSelect(selectedQuestion, type)}
                          className="py-2 px-4 rounded-lg font-bold bg-white border-2 border-gray-300 hover:bg-yellow-100"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      {questionTypes[selectedQuestion] === "MCQ" && (
                        <div className="flex flex-col gap-4">
                          <input
                            type="text"
                            placeholder="Enter MCQ question"
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
                          {Array.from({ length: 4 }).map((_, i) => (
                            <input
                              key={i}
                              type="text"
                              placeholder={`Option ${i + 1}`}
                              value={
                                questionData[selectedQuestion]?.options?.[i] ||
                                ""
                              }
                              onChange={(e) =>
                                handleOptionChange(
                                  selectedQuestion,
                                  i,
                                  e.target.value
                                )
                              }
                              className="border px-4 py-2 rounded"
                            />
                          ))}
                          <input
                            type="text"
                            placeholder="Correct answer (e.g. 2)"
                            value={questionData[selectedQuestion]?.answer || ""}
                            onChange={(e) =>
                              handleQuestionChange(
                                selectedQuestion,
                                "answer",
                                e.target.value
                              )
                            }
                            className="border px-4 py-2 rounded"
                          />
                        </div>
                      )}

                      {questionTypes[selectedQuestion] === "Coding" && (
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
                      )}

                      {questionTypes[selectedQuestion] === "Answer-based" && (
                        <div className="flex flex-col gap-4">
                          <input
                            type="text"
                            placeholder="Enter question"
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
                            placeholder="Expected short answer"
                            value={questionData[selectedQuestion]?.answer || ""}
                            onChange={(e) =>
                              handleQuestionChange(
                                selectedQuestion,
                                "answer",
                                e.target.value
                              )
                            }
                            className="border px-4 py-2 rounded"
                          />
                        </div>
                      )}

                      <button
                        onClick={() => handleSaveQuestion(selectedQuestion)}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
                      >
                        Save Question
                      </button>
                    </>
                  )}
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
