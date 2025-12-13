<<<<<<< HEAD
// src/pages/NextGenFreeEdu/Exam.jsx
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

/**
 * Exam component (updated)
 * - Fetches exam questions from: GET /api/nextgen/student/exams/:examId/questions
 * - Normalizes questions object -> array
 * - Renders MCQ options, text and code questions
 * - Timer, fullscreen detection, auto-submit and submission to backend are preserved
 */
=======
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935

export default function Exam() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get("examId"); // /nextgen/exam?examId=...

  // Exam state
  const [examData, setExamData] = useState(null); // meta info like title, duration, totalQuestions
  const [questions, setQuestions] = useState([]); // normalized array of question objects
  const [fetchedQuestions, setFetchedQuestions] = useState([]); // alias

  // UI state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // default fallback
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Availability / checking
  const [examAvailability, setExamAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
<<<<<<< HEAD
  const [warningMessage, setWarningMessage] = useState("");

  // Fullscreen + blur detection popup
=======
  const [warningMessage, setWarningMessage] = useState('');
  //Full screen mode handler
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
  const [showTopMessage, setShowTopMessage] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Student info
  const getStudentData = () => {
    const studentInfo = localStorage.getItem("studentInfo");
    return studentInfo ? JSON.parse(studentInfo) : null;
  };
  const studentData = getStudentData();
  const studentId = studentData?._id || studentData?.id || null;

  // Utility: format time (seconds) -> HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Answer change handler
  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Start exam: enter fullscreen, set examStartTime, set timer from examAvailability if present
  const handleStartExam = () => {
    setExamStarted(true);
    enterFullscreen();
    setExamStartTime(new Date().toISOString());
    if (examAvailability && examAvailability.timeRemaining) {
      setTimeLeft(examAvailability.timeRemaining);
    } else if (examData && examData.durationMinutes) {
      setTimeLeft(examData.durationMinutes * 60);
    }
  };

  // ------------------- FETCH EXAM META & QUESTIONS -------------------
  useEffect(() => {
    if (!examId) {
      setCheckingAvailability(false);
      console.warn("No examId in URL.");
      return;
    }

    const fetchExamQuestions = async () => {
      try {
        setCheckingAvailability(true);
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
        const token = localStorage.getItem("authToken");

        // If token missing, log and still try (backend might allow public access)
        if (!token) {
          console.warn("No authToken in localStorage — request will be sent without Authorization header.");
        }

        const res = await fetch(`${baseUrl}/nextgen/student/exams/${examId}/questions`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json().catch(() => {
          console.error("Failed to parse JSON from exam questions response.");
          return null;
        });

        if (!res.ok) {
          console.error("Failed to fetch exam questions:", data || res.statusText || res.status);
          // If unauthorized, show console message and stop
          if (res.status === 401) {
            console.error("Unauthorized. The token might be invalid or expired.");
          }
          setCheckingAvailability(false);
          return;
        }

        // Expecting data.success and data.data with questions (as you implemented)
        if (!data || !data.success || !data.data) {
          console.error("Exam questions API returned unexpected response:", data);
          setCheckingAvailability(false);
          return;
        }

        const payload = data.data;
        // payload example:
        // { examId, title, courseName, totalQuestions, questions: { q1: {...}, q2: {...} } }

        // set meta exam data
        setExamData({
          title: payload.title || payload.examName || "Exam",
          courseName: payload.courseName || "",
          totalQuestions: payload.totalQuestions || 0,
          durationMinutes: payload.durationMinutes || payload.duration || null,
        });

        // Normalize questions from object -> array
        // Your questions object format (example):
        // { q1: { type: 'MCQ', question: '...', options: ['a','b'], answer: 'b', testCase: '' }, q2: { ... } }
        const normalizeQuestions = (questionsObj) => {
          if (!questionsObj) return [];

          // If it's already an array, return a defensive copy
          if (Array.isArray(questionsObj)) {
            return questionsObj.map((q, idx) => ({
              id: q.id || `q${idx + 1}`,
              type: q.type || "Answer-based",
              question: q.question || "",
              options: Array.isArray(q.options) ? q.options : [],
              answer: q.answer ?? "",
              testCase: q.testCase ?? "",
              _origKey: q._origKey ?? null,
            }));
          }

          // If it's an object, map entries into array preserving keys
          return Object.entries(questionsObj).map(([key, q], idx) => {
            // Determine type canonicalization: map from stored string to our UI type
            // Accept possible stored variants: 'MCQ', 'multiple-choice', 'Coding', 'Answer-based', etc.
            let qType = (q.type || "").toString();
            if (!qType) {
              // Heuristic: if options present => MCQ; if testCase present => Coding; else text
              if (Array.isArray(q.options) && q.options.length) qType = "MCQ";
              else if (q.testCase) qType = "Coding";
              else qType = "Answer-based";
            }

            return {
              id: key,
              type: qType === "MCQ" || qType.toLowerCase().includes("mcq") || qType.toLowerCase().includes("multiple") ? "multiple-choice" :
                    qType.toLowerCase().includes("code") || qType.toLowerCase().includes("coding") ? "code" :
                    "text",
              question: q.question || q.prompt || "",
              options: Array.isArray(q.options) ? q.options : (q.choices && Array.isArray(q.choices) ? q.choices : []),
              answer: q.answer ?? "",
              testCase: q.testCase ?? "",
              _origKey: key,
            };
          });
        };

        // Normalize & set
        const normalized = normalizeQuestions(payload.questions);
        console.log("Fetched exam object:", payload);
        console.log("Normalized questions:", normalized);

        setFetchedQuestions(normalized);
        setQuestions(normalized);

      } catch (err) {
        console.error("Error fetching exam questions:", err);
      } finally {
        setCheckingAvailability(false);
      }
    };

    fetchExamQuestions();
  }, [examId]);

  // ------------------- Exam availability check (optional) -------------------
  useEffect(() => {
    if (!examId) return;

    const checkAvailability = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
        const res = await fetch(`${baseUrl}/nextgen/exams/${examId}/availability`);
        const data = await res.json().catch(() => null);
        if (res.ok && data && data.success) {
          setExamAvailability(data.data);
          // if availability returns duration/timeRemaining we can use it
          if (data.data.timeRemaining) {
            setTimeLeft(data.data.timeRemaining);
          } else if (data.data.durationMinutes) {
            setTimeLeft(data.data.durationMinutes * 60);
          }
        } else {
          // Not fatal - just set availability null
          console.warn("Could not fetch availability or not required.", data);
        }
      } catch (err) {
        console.warn("Availability check failed:", err);
      }
    };

    checkAvailability();
  }, [examId]);

  // ------------------- Timer effect with auto-submit -------------------
  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      // warnings
      if (timeLeft === 300 && !showTimeWarning) {
        setWarningMessage("⏰ 5 minutes remaining!");
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000);
      }
      if (timeLeft === 60 && !showTimeWarning) {
        setWarningMessage("⚠️ 1 minute remaining!");
        setShowTimeWarning(true);
        setTimeout(() => setShowTimeWarning(false), 5000);
      }

      const t = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }

    if (examStarted && !examSubmitted && timeLeft === 0) {
      alert("⏰ Time is up! Your exam will be submitted automatically.");
      handleSubmitExam();
    }
  }, [examStarted, examSubmitted, timeLeft, showTimeWarning]);

  // answered count
  const getAnsweredCount = () => Object.keys(answers).length;

  // ------------------- Fullscreen helpers -------------------
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };
<<<<<<< HEAD

  // Blur & fullscreen change detection (popup + auto-submit)
  useEffect(() => {
    const handleBlur = () => {
      if (!showPopup) {
=======
  // ENTER FULLSCREEN
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  // EXIT FULLSCREEN
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // BLUR + FULLSCREEN EXIT DETECT
  useEffect(() => {
    const handleBlur = () => {
      if (!showPopup) {
        console.log(showPopup);
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
        setShowTopMessage(true);
        setShowPopup(true);
        setCountdown(30);
      }
<<<<<<< HEAD
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !showPopup && examStarted && !examSubmitted) {
        setShowTopMessage(true);
        setShowPopup(true);
        setCountdown(30);
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [showPopup, examStarted, examSubmitted]);

  // Countdown for popup
  useEffect(() => {
    let interval = null;
    if (showPopup && countdown > 0) {
      interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    if (showPopup && countdown === 0) {
      setExamSubmitted(true);
      setShowPopup(false);
    }
    return () => clearInterval(interval);
  }, [showPopup, countdown]);

=======
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !showPopup) {
        setShowTopMessage(true);
        setShowPopup(true);
        setCountdown(30);
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  // COUNTDOWN LOGIC
  useEffect(() => {
    let interval;

    if (showPopup && countdown > 0) {
      interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    }

    if (countdown === 0 && showPopup) {
      setExamSubmitted(true);
      setShowPopup(false);
    }

    return () => clearInterval(interval);
  }, [showPopup, countdown]);

  // PROCEED BUTTON → RE-ENTER FULLSCREEN
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
  const handleOk = () => {
    enterFullscreen();
    setShowPopup(false);
    setShowTopMessage(false);
    setCountdown(30);
  };
  const handleCancel = () => {
<<<<<<< HEAD
    if (document.fullscreenElement) exitFullscreen();
=======
    if (document.fullscreenElement) exitFullscreen(); // only exit if fullscreen
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
    setExamSubmitted(true);
    setShowPopup(false);
    setShowTopMessage(false);
  };

<<<<<<< HEAD
  // ------------------- Scoring function (demo) -------------------
=======
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question) => {
      if (question.type === "multiple-choice") {
        if (String(answers[question.id]) === String(question.answer)) {
          correct++;
        }
      } else {
        // For text/code, rudimentary check: presence & length (demo)
        if (answers[question.id] && answers[question.id].toString().trim().length > 10) {
          correct++;
        }
      }
    });
    return questions.length ? Math.round((correct / questions.length) * 100) : 0;
  };

  // ------------------- Submit exam to backend (ng_submission_exams) -------------------
  async function handleSubmitExam() {
    try {
      if (isSubmitting || examSubmitted) return;
      if (!examId) {
        alert("Exam ID missing in URL.");
        return;
      }
      if (!studentId) {
        alert("Student not logged in. Please login again.");
        return;
      }

      setIsSubmitting(true);
      exitFullscreen();
      setSubmitError(null);

      const score = calculateScore();

<<<<<<< HEAD
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
      const token = localStorage.getItem("authToken");
=======
      console.log('=== FRONTEND SUBMISSION DEBUG ===');
      console.log('Exam ID:', examId);
      console.log('Student ID:', studentId);
      console.log('Answers being sent:', JSON.stringify(answers, null, 2));
      console.log('Score:', score);
      console.log('Started At:', examStartTime);

      const baseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935

      const res = await fetch(`${baseUrl}/nextgen/student/exams/${examId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentId,
          answers,
          score,
          startedAt: examStartTime,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.success) {
        console.error("Submit failed:", data);
        throw new Error((data && data.message) || "Failed to submit exam");
      }

      setExamSubmitted(true);
      setShowConfirmSubmit(false);
    } catch (err) {
      console.error("Error submitting exam:", err);
      setSubmitError(err.message || "Failed to submit exam");
      alert(err.message || "Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ------------------- UI Rendering -------------------
  // If exam submitted -> show result view
  if (examSubmitted) {
    const score = calculateScore();
    const passed = score >= (examData?.passingScore || 70);

    return (
      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <div className="service-card" style={{
            background: passed ? "linear-gradient(135deg,#dcfce7,#bbf7d0)" : "linear-gradient(135deg,#fef2f2,#fecaca)",
            border: passed ? "2px solid #22c55e" : "2px solid #ef4444",
            padding: "3rem 2rem"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{passed ? "🎉" : "📚"}</div>
            <h1 style={{ color: passed ? "#15803d" : "#dc2626", marginBottom: "1rem" }}>
              Exam {passed ? "Completed Successfully!" : "Completed"}
            </h1>

            <div style={{ background: "white", borderRadius: "0.75rem", padding: "2rem", marginBottom: "2rem" }}>
              <h2 style={{ color: "#374151", marginBottom: "1.5rem" }}>Your Results</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: passed ? "#22c55e" : "#ef4444" }}>{score}%</div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Final Score</div>
                </div>
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6" }}>{getAnsweredCount()}/{questions.length}</div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Questions Answered</div>
                </div>
              </div>

              <div style={{ padding: "1rem", background: passed ? "#f0fdf4" : "#fef2f2", borderRadius: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ fontWeight: "600", color: passed ? "#15803d" : "#dc2626", marginBottom: "0.5rem" }}>
                  {passed ? "Congratulations! You passed the exam." : "You need to retake the exam."}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Passing score: {examData?.passingScore ?? 70}% • Your score: {score}%
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/nextgen/results" className="btn-primary">View Detailed Results</Link>
              {!passed && <button onClick={() => {
                setExamSubmitted(false);
                setExamStarted(false);
                setAnswers({});
                setCurrentQuestion(0);
                setTimeLeft(examData?.durationMinutes ? examData.durationMinutes * 60 : 3600);
                setExamStartTime(null);
                setSubmitError(null);
              }} className="btn-secondary">Retake Exam</button>}
              <Link to="/nextgen/login" className="btn-outline">Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-exam checks
  if (!examStarted) {
    if (checkingAvailability) {
      return (
        <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <div className="service-card">
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
              <h2>Checking Exam Availability...</h2>
              <p style={{ color: "#6b7280" }}>Please wait while we verify exam access.</p>
            </div>
          </div>
        </div>
      );
    }

    // If examAvailability indicates not started / ended, show messages
    if (examAvailability && examAvailability.status === "not-started") {
      const startDate = new Date(examAvailability.startTime);
      const hours = Math.floor(examAvailability.timeUntilStart / 3600);
      const minutes = Math.floor((examAvailability.timeUntilStart % 3600) / 60);
      return (
        <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <div className="service-card" style={{ border: "2px solid #f59e0b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏰</div>
              <h2 style={{ color: "#d97706" }}>Exam Has Not Started Yet</h2>
              <p style={{ color: "#6b7280", margin: "1.5rem 0" }}>This exam will be available starting:</p>
              <div style={{ background: "#fef3c7", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem", color: "#92400e", fontWeight: "600" }}>
                {startDate.toLocaleString()}
              </div>
              <p style={{ color: "#6b7280" }}>Time remaining: {hours > 0 && `${hours}h `}{minutes}m</p>
              <Link to="/nextgen/login" className="btn-primary" style={{ marginTop: "2rem" }}>Back to Dashboard</Link>
            </div>
          </div>
        </div>
      );
    }

    if (examAvailability && examAvailability.status === "ended") {
      const endDate = new Date(examAvailability.endTime);
      return (
        <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <div className="service-card" style={{ border: "2px solid #ef4444" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
              <h2 style={{ color: "#dc2626" }}>Exam Has Ended</h2>
              <p style={{ color: "#6b7280", margin: "1.5rem 0" }}>This exam ended on:</p>
              <div style={{ background: "#fef2f2", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem", color: "#991b1b", fontWeight: "600" }}>
                {endDate.toLocaleString()}
              </div>
              <p style={{ color: "#6b7280" }}>No more submissions are allowed for this exam.</p>
              <Link to="/nextgen/login" className="btn-primary" style={{ marginTop: "2rem" }}>Back to Dashboard</Link>
            </div>
          </div>
        </div>
      );
    }

    // Default pre-exam instructions UI (uses examData or fallback)
    return (
      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>{examData?.title || "Exam"}</h1>
            <p style={{ color: "#6b7280", fontSize: "1.125rem" }}>
              {examData?.courseName || ""} • {examData?.durationMinutes ? `${examData.durationMinutes} minutes` : (examData?.duration || "")} • {examData?.totalQuestions || questions.length} Questions
            </p>
          </div>

          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div className="service-card">
              <h2 className="service-title">Exam Instructions</h2>
              <ul style={{ margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                <li style={{ marginBottom: "0.75rem", color: "#374151" }}>Read each question carefully before answering</li>
                <li style={{ marginBottom: "0.75rem", color: "#374151" }}>You can navigate between questions using the navigation panel</li>
                <li style={{ marginBottom: "0.75rem", color: "#374151" }}>Make sure to save your answers before submitting</li>
                <li style={{ marginBottom: "0.75rem", color: "#374151" }}>You cannot change answers after submission</li>
                <li style={{ marginBottom: "0.75rem", color: "#374151" }}>Ensure stable internet connection throughout the exam</li>
              </ul>

              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "0.5rem", padding: "1rem", marginTop: "1.5rem" }}>
                <div style={{ fontWeight: "600", color: "#92400e", marginBottom: "0.5rem" }}>⚠️ Important Notice</div>
                <div style={{ fontSize: "0.875rem", color: "#78350f" }}>Once you start the exam, the timer will begin and cannot be paused. Make sure you have a stable internet connection and enough time to complete the exam.</div>
              </div>
            </div>

            <div className="service-card">
              <h3 className="service-title">Exam Details</h3>
              <div style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>
                <div style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ fontWeight: "600", color: "#374151" }}>Duration</div>
                  <div style={{ color: "#6b7280" }}>{examData?.durationMinutes ? `${examData.durationMinutes} minutes` : (examData?.duration || "N/A")}</div>
                </div>
                <div style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ fontWeight: "600", color: "#374151" }}>Total Questions</div>
                  <div style={{ color: "#6b7280" }}>{examData?.totalQuestions || questions.length}</div>
                </div>
                <div style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ fontWeight: "600", color: "#374151" }}>Passing Score</div>
                  <div style={{ color: "#6b7280" }}>{examData?.passingScore ?? 70}%</div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#374151" }}>Question Types</div>
                  <div style={{ color: "#6b7280" }}>Multiple Choice, Text, Code</div>
                </div>
              </div>

              <button onClick={handleStartExam} className="btn-primary" style={{ width: "100%", marginTop: "1.5rem" }}>Start Exam</button>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem", padding: "2rem", background: "#f8fafc", borderRadius: "0.75rem" }}>
            <h3 style={{ color: "#374151", marginBottom: "1rem" }}>Need Help?</h3>
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>If you encounter any technical issues during the exam, contact support immediately.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="mailto:support@nextgenfreeedu.com" className="btn-outline">Contact Support</a>
              <Link to="/nextgen/login" className="btn-outline">Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIVE EXAM screen (show question & options)
  const currentQ = questions[currentQuestion] || {};

  return (
    <div style={styles.page}>
<<<<<<< HEAD
      {/* Top warning */}
      {showTopMessage && !examSubmitted && (
        <div style={{ ...styles.topWarning, ...styles.slideDown }}>⚠️ You exited fullscreen or switched the tab!</div>
      )}

      {/* Popup */}
=======
      {/* TOP WARNING DROPDOWN */}
      {showTopMessage && !examSubmitted && (
        <div style={{ ...styles.topWarning, ...styles.slideDown }}>
          ⚠️ You exited fullscreen or switched the tab!
        </div>
      )}

      {/* POPUP */}
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
      {showPopup && !examSubmitted && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <div style={styles.iconCircle}>⚠️</div>
            <h2 style={styles.title}>WARNING!</h2>
<<<<<<< HEAD
            <p style={styles.text}>You must stay in fullscreen mode. Return within {countdown} seconds or the exam will auto-submit.</p>
            <div style={styles.buttonRow}>
              <button style={styles.cancelBtn} onClick={handleCancel}>CANCEL</button>
              <button style={styles.proceedBtn} onClick={handleOk}>PROCEED</button>
            </div>
=======
            <p style={styles.text}>
              You must stay in fullscreen mode. Return within {countdown}{' '}
              seconds or the exam will auto-submit.
            </p>

            <div style={styles.buttonRow}>
              <button style={styles.cancelBtn} onClick={handleCancel}>
                CANCEL
              </button>
              <button style={styles.proceedBtn} onClick={handleOk}>
                PROCEED
              </button>
            </div>

>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
            <div style={styles.bottomStripe}></div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Auto-submitted overlay */}
      {examSubmitted && <div style={styles.autoSubmit}>Exam Auto-Submitted ❗</div>}

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Time warning banner */}
          {showTimeWarning && (
            <div style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              background: timeLeft <= 60 ? "#dc2626" : "#f59e0b",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              fontSize: "1.125rem",
              fontWeight: "600",
              animation: "pulse 1s ease-in-out infinite"
            }}>
              {warningMessage}
            </div>
          )}

          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            padding: "1rem",
            background: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#374151" }}>{examData?.title || "Exam"}</h1>
              <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280", fontSize: "0.875rem" }}>Question {currentQuestion + 1} of {questions.length}</p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: timeLeft < 600 ? "#ef4444" : "#374151", marginBottom: "0.25rem" }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Time Remaining</div>
            </div>
          </div>

          {/* Error notification */}
          {submitError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#b91c1c" }}>
=======
      {/* AUTO SUBMIT */}
      {examSubmitted && (
        <div style={styles.autoSubmit}>Exam Auto-Submitted ❗</div>
      )}

      <div
        className='container'
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Time Warning Banner */}
          {showTimeWarning && (
            <div
              style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: timeLeft <= 60 ? '#dc2626' : '#f59e0b',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                fontSize: '1.125rem',
                fontWeight: '600',
                animation: 'pulse 1s ease-in-out infinite',
              }}>
              {warningMessage}
            </div>
          )}

          {/* Exam Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  color: '#374151',
                }}>
                {examData.title}
              </h1>
              <p
                style={{
                  margin: '0.25rem 0 0 0',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                }}>
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: timeLeft < 600 ? '#ef4444' : '#374151',
                  marginBottom: '0.25rem',
                }}>
                {formatTime(timeLeft)}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                }}>
                Time Remaining
              </div>
            </div>
          </div>

          {submitError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                color: '#b91c1c',
                fontSize: '0.875rem',
              }}>
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
              {submitError}
            </div>
          )}

<<<<<<< HEAD
          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "1rem" }}>
            {/* Question Area */}
            <div className="service-card" style={{ height: "fit-content" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#374151", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                  {currentQ.question || "No question text available"}
                </h2>
              </div>

              {/* Answer Options for MCQ */}
              {currentQ.type === "multiple-choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {Array.isArray(currentQ.options) && currentQ.options.length ? currentQ.options.map((option, index) => (
                    <label key={index} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "1rem",
                      border: answers[currentQ.id] === index ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      background: answers[currentQ.id] === index ? "#f0f9ff" : "white",
                      transition: "all 0.2s ease"
                    }}>
                      <input type="radio" name={`question-${currentQ.id}`} value={index} checked={answers[currentQ.id] === index} onChange={() => handleAnswerChange(currentQ.id, index)} />
                      <span style={{ flex: 1 }}>{option}</span>
                    </label>
                  )) : (
                    <div style={{ color: "#6b7280" }}>No options provided for this question.</div>
                  )}
                </div>
              )}

              {/* Text or Code answer */}
              {(currentQ.type === "text" || currentQ.type === "code") && (
                <textarea value={answers[currentQ.id] || ""} onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)} rows={currentQ.type === "code" ? 8 : 4} className="form-input" placeholder={currentQ.type === "code" ? "Write your code here..." : "Write your answer here..."} style={{ fontFamily: currentQ.type === "code" ? "monospace" : "inherit", fontSize: currentQ.type === "code" ? "0.875rem" : "1rem" }} />
              )}

              {/* Navigation Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
                <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} className="btn-secondary" style={{ opacity: currentQuestion === 0 ? 0.5 : 1, cursor: currentQuestion === 0 ? "not-allowed" : "pointer" }}>Previous</button>

                {currentQuestion === questions.length - 1 ? (
                  <button onClick={() => setShowConfirmSubmit(true)} className="btn-primary" style={{ background: "#22c55e", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Exam"}
                  </button>
                ) : (
                  <button onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))} className="btn-primary">Next</button>
=======
          <div
            className='services-grid'
            style={{ gridTemplateColumns: '3fr 1fr' }}>
            {/* Question Area */}
            <div className='service-card' style={{ height: 'fit-content' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                  }}>
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#374151',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                  }}>
                  {currentQ.question}
                </h2>
              </div>

              {/* Answer Options */}
              {currentQ.type === 'multiple-choice' && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}>
                  {currentQ.options.map((option, index) => (
                    <label
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        border:
                          answers[currentQ.id] === index
                            ? '2px solid #3b82f6'
                            : '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        background:
                          answers[currentQ.id] === index ? '#f0f9ff' : 'white',
                        transition: 'all 0.2s ease',
                      }}>
                      <input
                        type='radio'
                        name={`question-${currentQ.id}`}
                        value={index}
                        checked={answers[currentQ.id] === index}
                        onChange={() => handleAnswerChange(currentQ.id, index)}
                      />
                      <span style={{ flex: 1 }}>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentQ.type === 'text' || currentQ.type === 'code') && (
                <textarea
                  value={answers[currentQ.id] || ''}
                  onChange={(e) =>
                    handleAnswerChange(currentQ.id, e.target.value)
                  }
                  rows={currentQ.type === 'code' ? 8 : 4}
                  className='form-input'
                  placeholder={
                    currentQ.type === 'code'
                      ? 'Write your code here...'
                      : 'Write your answer here...'
                  }
                  style={{
                    fontFamily:
                      currentQ.type === 'code' ? 'monospace' : 'inherit',
                    fontSize: currentQ.type === 'code' ? '0.875rem' : '1rem',
                  }}
                />
              )}

              {/* Navigation Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e5e7eb',
                }}>
                <button
                  onClick={() =>
                    setCurrentQuestion(Math.max(0, currentQuestion - 1))
                  }
                  disabled={currentQuestion === 0}
                  className='btn-secondary'
                  style={{
                    opacity: currentQuestion === 0 ? 0.5 : 1,
                    cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                  }}>
                  Previous
                </button>

                {currentQuestion === questions.length - 1 ? (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className='btn-primary'
                    style={{
                      background: '#22c55e',
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setCurrentQuestion(
                        Math.min(questions.length - 1, currentQuestion + 1)
                      )
                    }
                    className='btn-primary'>
                    Next
                  </button>
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
                )}
              </div>
            </div>

<<<<<<< HEAD
            {/* Navigation panel */}
            <div className="service-card" style={{ height: "fit-content" }}>
              <h3 className="service-title">Question Navigation</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {questions.map((q, index) => (
                  <button key={q.id} onClick={() => setCurrentQuestion(index)} style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.375rem",
                    border: "2px solid",
                    borderColor: currentQuestion === index ? "#3b82f6" : (answers[q.id] !== undefined ? "#22c55e" : "#e5e7eb"),
                    background: currentQuestion === index ? "#3b82f6" : (answers[q.id] !== undefined ? "#22c55e" : "white"),
                    color: currentQuestion === index || answers[q.id] !== undefined ? "white" : "#6b7280",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}>{index + 1}</button>
                ))}
              </div>

              <div style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: "1.6" }}>
                <div style={{ marginBottom: "0.5rem" }}><span style={{ color: "#22c55e" }}>●</span> Answered ({getAnsweredCount()})</div>
                <div style={{ marginBottom: "0.5rem" }}><span style={{ color: "#6b7280" }}>●</span> Not Answered ({questions.length - getAnsweredCount()})</div>
                <div><span style={{ color: "#3b82f6" }}>●</span> Current Question</div>
              </div>
            </div>
          </div>

          {/* Submit confirmation modal */}
          {showConfirmSubmit && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div className="service-card" style={{ maxWidth: "500px", margin: "1rem" }}>
                <h3 style={{ color: "#374151", marginBottom: "1rem" }}>Submit Exam?</h3>
                <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Are you sure you want to submit your exam? You have answered {getAnsweredCount()} out of {questions.length} questions. You cannot change your answers after submission.</p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                  <button onClick={() => setShowConfirmSubmit(false)} className="btn-secondary">Cancel</button>
                  <button onClick={handleSubmitExam} className="btn-primary" style={{ background: "#22c55e", opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Yes, Submit Exam"}</button>
=======
            {/* Question Navigation */}
            <div className='service-card' style={{ height: 'fit-content' }}>
              <h3 className='service-title'>Question Navigation</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}>
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '0.375rem',
                      border: '2px solid',
                      borderColor:
                        currentQuestion === index
                          ? '#3b82f6'
                          : answers[q.id] !== undefined
                          ? '#22c55e'
                          : '#e5e7eb',
                      background:
                        currentQuestion === index
                          ? '#3b82f6'
                          : answers[q.id] !== undefined
                          ? '#22c55e'
                          : 'white',
                      color:
                        currentQuestion === index || answers[q.id] !== undefined
                          ? 'white'
                          : '#6b7280',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}>
                    {index + 1}
                  </button>
                ))}
              </div>

              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6',
                }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#22c55e' }}>●</span> Answered (
                  {getAnsweredCount()})
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: '#6b7280' }}>●</span> Not Answered (
                  {questions.length - getAnsweredCount()})
                </div>
                <div>
                  <span style={{ color: '#3b82f6' }}>●</span> Current Question
                </div>
              </div>
            </div>
          </div>

          {/* Submit Confirmation Modal */}
          {showConfirmSubmit && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}>
              <div
                className='service-card'
                style={{ maxWidth: '500px', margin: '1rem' }}>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
                  Submit Exam?
                </h3>
                <p
                  style={{
                    color: '#6b7280',
                    marginBottom: '1.5rem',
                  }}>
                  Are you sure you want to submit your exam? You have answered{' '}
                  {getAnsweredCount()} out of {questions.length} questions. You
                  cannot change your answers after submission.
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end',
                  }}>
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className='btn-secondary'>
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitExam}
                    className='btn-primary'
                    style={{
                      background: '#22c55e',
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Yes, Submit Exam'}
                  </button>
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
                </div>
              </div>
            </div>
          )}
<<<<<<< HEAD

=======
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD

/* ------------------ Warning CSS ------------------ */
const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#e8ffe8",
    position: "relative",
    fontFamily: "Arial, sans-serif",
  },
  topWarning: {
    width: "100%",
    background: "#ff4d4d",
    padding: "12px",
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 50,
  },
  slideDown: {
    animation: "slideDown 0.4s ease forwards",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  popup: {
    width: "350px",
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
  },
  iconCircle: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#ff7043",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontSize: "32px",
    margin: "10px auto",
  },
  title: { fontSize: "22px", fontWeight: "bold" },
  text: { fontSize: "14px", color: "#555", margin: "10px 0 20px" },
  buttonRow: { display: "flex", gap: "10px" },
  cancelBtn: {
    width: "50%",
    padding: "10px",
    border: "1px solid black",
    background: "black",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
  proceedBtn: {
    width: "50%",
    padding: "10px",
    background: "#ff5722",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  bottomStripe: {
    width: "100%",
    height: "12px",
    marginTop: "15px",
    background: "repeating-linear-gradient(45deg, #ff5722, #ff5722 10px, white 10px, white 20px)",
    borderRadius: "0 0 10px 10px",
  },
  autoSubmit: {
    position: "fixed",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    background: "rgba(0,0,0,0.7)",
    fontSize: "28px",
    zIndex: 200,
  },
};

/* Inject KEYFRAME animation if not already present */
if (typeof document !== "undefined") {
  const existing = document.getElementById("exam-keyframes");
  if (!existing) {
    const style = document.createElement("style");
    style.id = "exam-keyframes";
    style.innerHTML = "@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }";
    document.head.appendChild(style);
  }
}
=======
/* ------------------ Warning CSS ------------------ */
const styles = {
  page: {
    width: '100%',
    height: '100vh',
    background: '#e8ffe8',
    position: 'relative',
    fontFamily: 'Arial',
  },
  topWarning: {
    width: '100%',
    background: '#ff4d4d',
    padding: '12px',
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 50,
  },
  slideDown: {
    animation: 'slideDown 0.4s ease forwards',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  popup: {
    width: '350px',
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
  },
  iconCircle: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: '#ff7043',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '32px',
    margin: '10px auto',
  },
  title: { fontSize: '22px', fontWeight: 'bold' },
  text: { fontSize: '14px', color: '#555', margin: '10px 0 20px' },
  buttonRow: { display: 'flex', gap: '10px' },
  cancelBtn: {
    width: '50%',
    padding: '10px',
    border: '1px solid black',
    background: 'black',
    color: 'white', // FIX
    borderRadius: '6px',
    cursor: 'pointer',
  },

  proceedBtn: {
    width: '50%',
    padding: '10px',
    background: '#ff5722',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  bottomStripe: {
    width: '100%',
    height: '12px',
    marginTop: '15px',
    background:
      'repeating-linear-gradient(45deg, #ff5722, #ff5722 10px, white 10px, white 20px)',
    borderRadius: '0 0 10px 10px',
  },
  autoSubmit: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    background: 'rgba(0,0,0,0.7)',
    fontSize: '28px',
    zIndex: 200,
  },
  content: { textAlign: 'center', marginTop: '100px' },
  startBtn: {
    padding: '12px 25px',
    background: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
  },
};

/* Inject KEYFRAME animation */
const style = document.createElement('style');
style.innerHTML = `@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }`;
document.head.appendChild(style);
>>>>>>> 660ec3f6c48d8df416cf3d2b7a30cf3fd5272935
