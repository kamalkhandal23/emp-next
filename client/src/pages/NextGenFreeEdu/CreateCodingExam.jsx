import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/api';

function CreateCodingExam() {
  const navigate = useNavigate();
  const [totalQuestions, setTotalQuestions] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [examName, setExamName] = useState('');
  const [courseName, setCourseName] = useState(''); // Course name field
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionTypes, setQuestionTypes] = useState({});
  const [questionData, setQuestionData] = useState({}); // Store actual questions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
          const token = localStorage.getItem("authToken");

          const response = await fetch("http://localhost:5002/api/nextgen/courses/my-courses", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const res = await response.json();

          if (res.success) {
            console.log(res)
            setCourses(res.data.courses)
            // setCourses(data.data.courses);
          }

            
      }catch (e) {
          console.log("Error fetching courses", e);
          alert("error in fetching courses",e.message)
      }finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(totalQuestions);
    if (num > 0 && !isNaN(num)) {
      setTotalQuestions(num);
      setSubmitted(true);
    }
  };

  const handleTypeSelect = (qNum, type) => {
    // Only allow 'Coding' type
    if (type !== 'Coding') return;

    setQuestionTypes((prev) => ({ ...prev, [qNum]: type }));
    setQuestionData((prev) => ({
      ...prev,
      [qNum]: prev[qNum] || {
        type,
        question: '',
        options: [],
        answer: '',
        testCase: '',
      },
    }));
  };

  const handleQuestionChange = (qNum, field, value) => {
    setQuestionData((prev) => ({
      ...prev,
      [qNum]: { ...prev[qNum], [field]: value },
    }));
  };

  const handleSampleInputChange = (qNum, index, value) => {
    setQuestionData((prev) => {
      const question = prev[qNum] || {};
      const sampleInputs = [...(question.sampleInputs || [])];
      sampleInputs[index] = value;
      return {
        ...prev,
        [qNum]: { ...question, sampleInputs },
      };
    });
  };

  const handleSampleOutputChange = (qNum, index, value) => {
    setQuestionData((prev) => {
      const question = prev[qNum] || {};
      const sampleOutputs = [...(question.sampleOutputs || [])];
      sampleOutputs[index] = value;
      return {
        ...prev,
        [qNum]: { ...question, sampleOutputs },
      };
    });
  };

  const addSampleTestCase = (qNum) => {
    setQuestionData((prev) => {
      const question = prev[qNum] || {};
      const sampleInputs = [...(question.sampleInputs || []), ''];
      const sampleOutputs = [...(question.sampleOutputs || []), ''];
      return {
        ...prev,
        [qNum]: { ...question, sampleInputs, sampleOutputs },
      };
    });
  };

  const removeSampleTestCase = (qNum, index) => {
    setQuestionData((prev) => {
      const question = prev[qNum] || {};
      const sampleInputs = [...(question.sampleInputs || [])];
      const sampleOutputs = [...(question.sampleOutputs || [])];
      sampleInputs.splice(index, 1);
      sampleOutputs.splice(index, 1);
      return {
        ...prev,
        [qNum]: { ...question, sampleInputs, sampleOutputs },
      };
    });
  };

  const handleSaveQuestion = (qNum) => {
    alert(`Question ${qNum} saved ✅`);
    setSelectedQuestion(null);
  };

  const allQuestionsTyped =
    Object.keys(questionTypes).length === totalQuestions;

  const handleFinalizeCodingExam = async () => {
    // Validate all questions are filled
    const allQuestionsFilled = Object.keys(questionData).every((qNum) => {
      const q = questionData[qNum];
      if (!q.question || q.question.trim() === '') return false;

      if (q.type !== 'Coding') return false;

      // Check for sample inputs and outputs
      if (!q.sampleInputs || !Array.isArray(q.sampleInputs) || q.sampleInputs.length === 0) return false;
      if (!q.sampleOutputs || !Array.isArray(q.sampleOutputs) || q.sampleOutputs.length === 0) return false;
      if (q.sampleInputs.length !== q.sampleOutputs.length) return false;

      // Check that at least one sample pair is not empty
      const hasValidSample = q.sampleInputs.some(input => input && input.trim() !== '') &&
                            q.sampleOutputs.some(output => output && output.trim() !== '');
      if (!hasValidSample) return false;

      return true;
    });

    if (!allQuestionsFilled) {
      alert(
        '⚠️ Please fill in all question details including at least one sample input/output pair for each coding question before finalizing the coding exam.'
      );
      return;
    }

    if (!examName || examName.trim() === '') {
      alert('⚠️ Please provide an exam name.');
      return;
    }

    if (!courseName || courseName.trim() === '') {
      alert('⚠️ Please provide a course name.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const examData = {
        examName: examName.trim(),
        courseName: courseName.trim(),
        totalQuestions: parseInt(totalQuestions),
        questionData: questionData,
      };

      console.log('Submitting coding exam data:', examData);

      const response = await apiClient.createNextGenCodingExam(examData);

      if (response.success) {
        setSubmitSuccess(true);
        alert(
          `✅ Coding exam "${examName}" created successfully!\n\nExam ID: ${response.data.id}`
        );

        // Reset form after successful submission
        setTimeout(() => {
          setTotalQuestions('');
          setSubmitted(false);
          setExamName('');
          setCourseName('');
          setSelectedQuestion(null);
          setQuestionTypes({});
          setQuestionData({});
          setSubmitSuccess(false);
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create coding exam');
      }
    } catch (error) {
      console.error('Error creating coding exam:', error);
      setSubmitError(
        error.message || 'Failed to create coding exam. Please try again.'
      );
      alert(
        `❌ Error: ${
          error.message || 'Failed to create coding exam. Please try again.'
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6 md:p-10'>
      <div className='max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-6 md:p-10'>
        <header className='text-center mb-10 border-b pb-4 relative'>
          <button
            onClick={() => navigate('/portal/coursemanager')}
            className='absolute left-0 top-0 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200'>
            ← Back
          </button>
          <h1
            className='text-4xl md:text-5xl font-extrabold text-black tracking-tight'
            style={{ color: 'black' }}>
            💻 Coding Exam Creator
          </h1>
          <p className='text-gray-500 mt-2'>
            Design your coding exam structure step-by-step.
          </p>
        </header>

        {/* Step 1: Enter number of questions */}
        {!submitted ? (
          <div className='max-w-md mx-auto p-8 bg-blue-50 border border-blue-200 rounded-lg shadow-lg'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
              <label className='text-lg text-gray-700 font-medium text-left'>
                Courses
              </label>

              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className='border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-3 text-xl text-black transition duration-200 shadow-sm'
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5rem',
                  paddingRight: '3rem',
                }}
                required>
                <option value='' disabled>
                  {loadingCourses
                    ? 'Loading courses...'
                    : 'Select a course'}
                </option>
                {courses.map((course, index) => (
                  <option key={index} value={course.title}>
                    {course.title}
                  </option>
                ))}
              </select>

              <label className='text-lg text-gray-700 font-medium text-left'>
                Name of your Coding Exam
              </label>

              <input
                type='text'
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className='border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-3 text-xl text-black transition duration-200 shadow-sm'
                placeholder='e.g, React coding fundamentals'
                required
              />

              <label className='text-lg text-gray-700 font-medium text-left'>
                How many coding questions will be in this exam?
              </label>

              <input
                type='number'
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className='border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-3 text-xl text-black transition duration-200 shadow-sm'
                placeholder='e.g., 5'
                min='1'
                required
              />

              <div className='flex gap-4'>
                <button
                  type='button'
                  onClick={() => navigate('/portal/coursemanager')}
                  className='flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md'>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={
                    totalQuestions < 1 || !examName.trim() || !courseName.trim()
                  }
                  className='flex-1 bg-blue-400 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 shadow-md'>
                  Start Designing
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Step 2: Choose question types */}
            <div className='flex flex-col gap-8'>
              <div className='text-center'>
                <h2
                  className='text-2xl font-bold text-gray-600 mb-2'
                  style={{ color: 'black' }}>
                  Course: {courseName}
                </h2>
                <h2
                  className='text-3xl font-bold text-black'
                  style={{ color: 'black' }}>
                  {examName}
                </h2>
              </div>

              <div className='border p-4 rounded-lg bg-gray-50'>
                <p className='text-sm text-gray-600 font-medium mb-3'>
                  Click a question number
                </p>
                <div className='flex flex-wrap justify-start gap-3'>
                  {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                    (num) => {
                      const isSelected = selectedQuestion === num;
                      const type = questionTypes[num];
                      return (
                        <button
                          key={num}
                          onClick={() => setSelectedQuestion(num)}
                          className={`px-5 py-2 rounded-full font-semibold border-2 transition ${
                            type
                              ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200'
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                          } ${isSelected ? 'scale-105 shadow-md' : ''}`}>
                          Q{num} {type && '✓'}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Step 3: Choose or edit question content */}
              {selectedQuestion && examName && (
                <div className='p-6 bg-yellow-50 border-t-4 border-yellow-400 rounded-lg shadow-lg'>
                  <h3
                    className='text-xl font-bold mb-4 text-black'
                    style={{ color: 'black' }}>
                    Coding Question {selectedQuestion}
                  </h3>

                  {!questionTypes[selectedQuestion] ? (
                    <div className='flex gap-4'>
                      <button
                        onClick={() =>
                          handleTypeSelect(selectedQuestion, 'Coding')
                        }
                        className='py-3 px-6 rounded-lg font-bold bg-white border-2 border-gray-300 hover:bg-yellow-100'>
                        Coding
                      </button>
                    </div>
                  ) : (
                    <>
                      {questionTypes[selectedQuestion] === 'Coding' && (
                        <div className='flex flex-col gap-4'>
                          <input
                            type='text'
                            placeholder='Enter coding question'
                            value={
                              questionData[selectedQuestion]?.question || ''
                            }
                            onChange={(e) =>
                              handleQuestionChange(
                                selectedQuestion,
                                'question',
                                e.target.value
                              )
                            }
                            className='border px-4 py-2 rounded'
                          />

                          <div>
                            <h4 className='font-semibold mb-2'>Sample Test Cases</h4>
                            <p className='text-sm text-gray-600 mb-3'>
                              Add sample inputs and expected outputs for students to test their code before submission.
                            </p>

                            {(questionData[selectedQuestion]?.sampleInputs || []).map((input, index) => (
                              <div key={index} className='border rounded p-3 mb-3 bg-white'>
                                <div className='flex justify-between items-center mb-2'>
                                  <h5 className='font-medium'>Test Case {index + 1}</h5>
                                  <button
                                    type='button'
                                    onClick={() => removeSampleTestCase(selectedQuestion, index)}
                                    className='text-red-500 hover:text-red-700 text-sm'
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className='grid grid-cols-2 gap-3'>
                                  <div>
                                    <label className='block text-sm font-medium mb-1'>Input</label>
                                    <textarea
                                      placeholder='Enter sample input'
                                      value={input}
                                      onChange={(e) =>
                                        handleSampleInputChange(selectedQuestion, index, e.target.value)
                                      }
                                      className='border px-3 py-2 rounded w-full text-sm'
                                      rows={3}
                                    />
                                  </div>
                                  <div>
                                    <label className='block text-sm font-medium mb-1'>Expected Output</label>
                                    <textarea
                                      placeholder='Enter expected output'
                                      value={
                                        questionData[selectedQuestion]?.sampleOutputs?.[index] || ''
                                      }
                                      onChange={(e) =>
                                        handleSampleOutputChange(selectedQuestion, index, e.target.value)
                                      }
                                      className='border px-3 py-2 rounded w-full text-sm'
                                      rows={3}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}

                            <button
                              type='button'
                              onClick={() => addSampleTestCase(selectedQuestion)}
                              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm'
                            >
                              + Add Sample Test Case
                            </button>
                          </div>

                          <textarea
                            placeholder='Additional test case description or notes (optional)'
                            value={
                              questionData[selectedQuestion]?.testCase || ''
                            }
                            onChange={(e) =>
                              handleQuestionChange(
                                selectedQuestion,
                                'testCase',
                                e.target.value
                              )
                            }
                            className='border px-4 py-2 rounded'
                            rows={3}
                          />
                        </div>
                      )}

                      <button
                        onClick={() => handleSaveQuestion(selectedQuestion)}
                        className='mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg'>
                        Save Question
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {allQuestionsTyped && (
              <div className='mt-8 text-center'>
                {submitError && (
                  <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
                    <p className='font-semibold'>Error:</p>
                    <p>{submitError}</p>
                  </div>
                )}

                {submitSuccess && (
                  <div className='mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg'>
                    <p className='font-semibold'>
                      ✅ Coding exam created successfully!
                    </p>
                    <p>Redirecting...</p>
                  </div>
                )}

                <div className='flex gap-4 justify-center'>
                  <button
                    type='button'
                    onClick={() => {
                      if (
                        window.confirm(
                          'Are you sure you want to cancel? All unsaved progress will be lost.'
                        )
                      ) {
                        navigate('/portal/coursemanager');
                      }
                    }}
                    disabled={isSubmitting || submitSuccess}
                    className={`bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl transition duration-200 text-lg shadow-xl ${
                      isSubmitting || submitSuccess
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}>
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalizeCodingExam}
                    disabled={isSubmitting || submitSuccess}
                    className={`bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 px-10 rounded-xl transition duration-200 text-lg shadow-xl ${
                      isSubmitting || submitSuccess
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}>
                    {isSubmitting ? (
                      <span className='flex items-center justify-center gap-2'>
                        <svg
                          className='animate-spin h-5 w-5 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'>
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                        Creating Coding Exam...
                      </span>
                    ) : submitSuccess ? (
                      '✅ Coding Exam Created!'
                    ) : (
                      'Finalize & Submit Coding Exam'
                    )}
                  </button>
                </div>

                <p className='mt-3 text-sm text-gray-600'>
                  This will save your coding exam to the database
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CreateCodingExam;
