import React, { useState } from "react";

function CreateExam() {
  const [totalQuestions, setTotalQuestions] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [examName , setExamName] = useState("")
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionTypes, setQuestionTypes] = useState({});
  const [questionData, setQuestionData] = useState({}); // NEW: store actual questions

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

  const allQuestionsTyped =
    Object.keys(questionTypes).length === totalQuestions;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-6 md:p-10">
        <header className="text-center mb-10 border-b pb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 tracking-tight">
            ✍️ Exam Creator 
          </h1>
          <p className="text-gray-500 mt-2">
            Design your exam structure step-by-step.
          </p>
        </header>

        {/* Step 1: Enter number of questions */}
        {!submitted ? (
          <div className="max-w-md mx-auto p-8 bg-blue-50 border border-blue-200 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 bg-green-500 rounded">
                Define Exam
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                <label className="text-lg text-gray-700 font-medium text-left">
                    Name of your Exam
                </label>

                 <input
                    type="string"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-3 text-xl text-black transition duration-200 shadow-sm"
                    placeholder="e.g, React fundamentals"
                    min="1"
                />

                <label className="text-lg text-gray-700 font-medium text-left">
                    How many questions will be in this exam?
                </label>



              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="border-2 border-blue-300 focus:border-blue-500 rounded-lg px-4 py-3 text-xl text-black transition duration-200 shadow-sm"
                placeholder="e.g., 10"
                min="1"
              />

              <button
                type="submit"
                disabled={totalQuestions < 1}
                className="w-full bg-blue-400 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 shadow-md"
              >
                Start Designing
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Step 2: Choose question types */}
            <div className="flex flex-col gap-8">
              <h2 className="text-3xl font-bold text-black bg-blue-400">
                {examName}
              </h2>

              <div className="border p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 font-medium mb-3">
                  Click a question number to select its type or edit it.
                </p>
                <div className="flex flex-wrap justify-start gap-3">
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
                              ? "bg-green-100 border-green-500 text-green-700 hover:bg-green-200"
                              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
                          } ${isSelected ? "scale-105 shadow-md" : ""}`}
                        >
                          Q{num} {type && "✓"}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Step 3: Choose or edit question content */}
              {selectedQuestion  && examName && (
                <div className="p-6 bg-yellow-50 border-t-4 border-yellow-400 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-yellow-800">
                    Question {examName}
                  </h3>
                  <h3 className="text-xl font-bold mb-4 text-yellow-800">
                    Question {selectedQuestion}
                  </h3>

                  {!questionTypes[selectedQuestion] ? (
                    <div className="flex gap-4">
                      {["MCQ", "Coding", "Answer-based"].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleTypeSelect(selectedQuestion, type)}
                          className="py-3 px-6 rounded-lg font-bold bg-white border-2 border-gray-300 hover:bg-yellow-100"
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
            </div>

            {allQuestionsTyped && (
              <div className="mt-8 text-center">
                <button
                  onClick={() =>
                    console.log("Final Exam Data:", questionData)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 px-10 rounded-xl transition duration-200 text-lg shadow-xl"
                >
                  Finalize Exam Structure
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CreateExam;
