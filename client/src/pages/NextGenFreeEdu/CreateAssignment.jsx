import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/api';

function CreateAssignment() {
  const navigate = useNavigate();
  const [totalQuestions, setTotalQuestions] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [assignmentName, setAssignmentName] = useState('');
  const [courseName, setCourseName] = useState(''); // Course name field
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionTypes, setQuestionTypes] = useState({});
  const [questionData, setQuestionData] = useState({}); // Store actual questions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
          const token = localStorage.getItem("authToken");

          const response = await fetch("https://emp-new-2.onrender.com/api/nextgen/courses/my-courses", {
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
        }
      // try {
      //   const response = await apiClient.getNextGenCourses();
      //   if (response.success && response.data) {
      //     console.log("response",response)
      //     const coursesArray = response.data.courses || [];
      //     setCourses(coursesArray);
      //   }
      // } catch (error) {
      //   console.error('Error fetching courses:', error);
       finally {
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
    setQuestionTypes((prev) => ({ ...prev, [qNum]: type }));
    setQuestionData((prev) => ({
      ...prev,
      [qNum]: prev[qNum] || { type, question: '', options: [], answer: '' },
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

  const allQuestionsTyped =
    Object.keys(questionTypes).length === totalQuestions;

  const handleFinalizeAssignment = async () => {
    // Validate all questions are filled
    const allQuestionsFilled = Object.keys(questionData).every((qNum) => {
      const q = questionData[qNum];
      if (!q.question || q.question.trim() === '') return false;

      if (q.type === 'MCQ') {
        return (
          q.options &&
          q.options.length === 4 &&
          q.options.every((opt) => opt && opt.trim() !== '') &&
          q.answer &&
          q.answer.trim() !== ''
        );
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
      alert(
        '⚠️ Please fill in all question details before finalizing the assignment.'
      );
      return;
    }

    if (!assignmentName || assignmentName.trim() === '') {
      alert('⚠️ Please provide an assignment name.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const assignmentData = {
        assignmentName: assignmentName.trim(),
        courseName: courseName,
        totalQuestions: parseInt(totalQuestions),
        questionData: questionData,
      };

      console.log('Submitting assignment data:', assignmentData);

      const response = await apiClient.createNextGenAssignment(assignmentData);

      if (response.success) {
        setSubmitSuccess(true);
        alert(
          `✅ Assignment "${assignmentName}" created successfully!\n\nAssignment ID: ${response.data.id}`
        );

        // Reset form after successful submission
        setTimeout(() => {
          setTotalQuestions('');
          setSubmitted(false);
          setAssignmentName('');
          setCourseName('');
          setSelectedQuestion(null);
          setQuestionTypes({});
          setQuestionData({});
          setSubmitSuccess(false);
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setSubmitError(
        error.message || 'Failed to create assignment. Please try again.'
      );
      alert(
        `❌ Error: ${
          error.message || 'Failed to create assignment. Please try again.'
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
            onClick={() => navigate(-1)}
            className='absolute left-0 top-0 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium'
            title='Back to Course Manager'>
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            Back
          </button>
          <h1
            className='text-4xl md:text-5xl font-extrabold text-black tracking-tight'
            style={{ color: 'black' }}>
            ✍️ Assignment Creator
          </h1>
          <p className='text-gray-500 mt-2'>
            Design your assignment structure step-by-step.
          </p>
        </header>

        {/* Step 1: Enter number of questions */}
        {!submitted ? (
          <div className='max-w-md mx-auto p-8 bg-blue-50 border border-blue-200 rounded-lg shadow-lg'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
              <label className='text-lg text-gray-700 font-medium text-left'>
                Course Name
              </label>
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className='border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-xl text-black transition duration-200 shadow-sm bg-white cursor-pointer hover:border-blue-400'
                required
                disabled={loadingCourses}
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '3rem',
                }}>
                <option value='' disabled>
                  {loadingCourses ? 'Loading courses...' : 'Select a course'}
                </option>
                {courses.map((course) => (
                    <option key={course._id} value={course.title}>
                    {course.title}
                    </option>
                  ))}
              </select>

              <label className='text-lg text-gray-700 font-medium text-left'>
                Name of your Assignment
              </label>

              <input
                type='text'
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                className='border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-3 text-xl text-black transition duration-200 shadow-sm'
                placeholder='e.g, React fundamentals assignment'
                required
              />

              <label className='text-lg text-gray-700 font-medium text-left'>
                How many questions will be in this assignment?
              </label>

              <input
                type='number'
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className='border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-3 text-xl text-black transition duration-200 shadow-sm'
                placeholder='e.g., 10'
                min='1'
                required
              />

              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => navigate(-1)}
                  className='flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md'>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={
                    totalQuestions < 1 ||
                    !assignmentName.trim() ||
                    !courseName.trim()
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
                  {assignmentName}
                </h2>
              </div>

              <div className='border p-4 rounded-lg bg-gray-50'>
                <p className='text-sm text-gray-600 font-medium mb-3'>
                  Click a question number to select its type or edit it.
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
              {selectedQuestion && assignmentName && (
                <div className='p-6 bg-yellow-50 border-t-4 border-yellow-400 rounded-lg shadow-lg'>
                  <h3
                    className='text-xl font-bold mb-4 text-black'
                    style={{ color: 'black' }}>
                    Question {selectedQuestion}
                  </h3>

                  {!questionTypes[selectedQuestion] ? (
                    <div className='flex gap-4'>
                      {['MCQ', 'Coding', 'Answer-based'].map((type) => (
                        <button
                          key={type}
                          onClick={() =>
                            handleTypeSelect(selectedQuestion, type)
                          }
                          className='py-3 px-6 rounded-lg font-bold bg-white border-2 border-gray-300 hover:bg-yellow-100'>
                          {type}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      {questionTypes[selectedQuestion] === 'MCQ' && (
                        <div className='flex flex-col gap-4'>
                          <input
                            type='text'
                            placeholder='Enter MCQ question'
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
                          {Array.from({ length: 4 }).map((_, i) => (
                            <input
                              key={i}
                              type='text'
                              placeholder={`Option ${i + 1}`}
                              value={
                                questionData[selectedQuestion]?.options?.[i] ||
                                ''
                              }
                              onChange={(e) =>
                                handleOptionChange(
                                  selectedQuestion,
                                  i,
                                  e.target.value
                                )
                              }
                              className='border px-4 py-2 rounded'
                            />
                          ))}
                          <input
                            type='text'
                            placeholder='Correct answer (e.g. 2)'
                            value={questionData[selectedQuestion]?.answer || ''}
                            onChange={(e) =>
                              handleQuestionChange(
                                selectedQuestion,
                                'answer',
                                e.target.value
                              )
                            }
                            className='border px-4 py-2 rounded'
                          />
                        </div>
                      )}

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
                          <textarea
                            placeholder='Describe test case or expected logic'
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
                          />
                        </div>
                      )}

                      {questionTypes[selectedQuestion] === 'Answer-based' && (
                        <div className='flex flex-col gap-4'>
                          <input
                            type='text'
                            placeholder='Enter question'
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
                          <textarea
                            placeholder='Expected short answer'
                            value={questionData[selectedQuestion]?.answer || ''}
                            onChange={(e) =>
                              handleQuestionChange(
                                selectedQuestion,
                                'answer',
                                e.target.value
                              )
                            }
                            className='border px-4 py-2 rounded'
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
                      ✅ Assignment created successfully!
                    </p>
                    <p>Redirecting...</p>
                  </div>
                )}

                <div className='flex gap-4 justify-center'>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Are you sure you want to cancel? All progress will be lost.'
                        )
                      ) {
                        navigate('/portal/coursemanager');
                      }
                    }}
                    disabled={isSubmitting || submitSuccess}
                    className={`bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-xl transition duration-200 text-lg shadow-xl ${
                      isSubmitting || submitSuccess
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}>
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalizeAssignment}
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
                        Creating Assignment...
                      </span>
                    ) : submitSuccess ? (
                      '✅ Assignment Created!'
                    ) : (
                      'Finalize & Submit Assignment'
                    )}
                  </button>
                </div>

                <p className='mt-3 text-sm text-gray-600'>
                  This will save your assignment to the database
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CreateAssignment;
