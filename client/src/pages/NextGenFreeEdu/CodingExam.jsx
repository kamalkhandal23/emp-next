import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { apiClient } from '../../utils/api'

export default function CodingExam() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [codes, setCodes] = useState({})
  const [questionLanguages, setQuestionLanguages] = useState({})
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const languages = [
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' }
  ]

  const defaultCode = {
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    python: `print("Hello, World!")`,
    javascript: `console.log("Hello, World!");`
  }

  useEffect(() => {
    fetchExam()
  }, [id])

  useEffect(() => {
    if (exam && exam.questions) {
      const questionKeys = Object.keys(exam.questions)
      const newCodes = { ...codes }
      const newLanguages = { ...questionLanguages }

      questionKeys.forEach(key => {
        if (!newCodes[key]) {
          newCodes[key] = defaultCode['javascript'] || ''
        }
        if (!newLanguages[key]) {
          newLanguages[key] = 'javascript'
        }
      })

      setCodes(newCodes)
      setQuestionLanguages(newLanguages)
      setRunResult(null)
    }
  }, [exam])

  const fetchExam = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apiClient.getNextGenCodingExamById(id)

      if (response.success) {
        setExam(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch coding exam')
      }
    } catch (err) {
      console.error('Error fetching coding exam:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runCode = async () => {
    if (!exam || !exam.questions) return

    setRunning(true)
    setRunResult(null)

    try {
      const questionKey = Object.keys(exam.questions)[currentQuestion]
      const response = await apiClient.runCodingExamCode({
        examId: id,
        questionId: questionKey,
        code: codes[questionKey] || '',
        language: questionLanguages[questionKey] || 'javascript'
      })

      if (response.success) {
        const result = response.data
        setRunResult({
          success: result.overallVerdict === 'Accepted',
          overallVerdict: result.overallVerdict,
          passedCount: result.passedCount,
          totalTests: result.totalTests,
          successRate: result.successRate,
          testResults: result.results,
          verdict: result.overallVerdict
        })
      } else {
        throw new Error(response.message || 'Failed to run code')
      }
    } catch (err) {
      setRunResult({
        success: false,
        error: "Execution failed: " + err.message
      })
    } finally {
      setRunning(false)
    }
  }

  const submitExam = async () => {
    setSubmitting(true)
    try {
      const submissions = Object.keys(exam.questions).map(key => ({
        questionId: key,
        code: codes[key] || '',
        language: questionLanguages[key] || 'javascript'
      }))

      const response = await apiClient.submitCodingExam({
        examId: id,
        submissions
      })

      if (response.success) {
        // Navigate to results page
        navigate('/nextgen/results')
      } else {
        throw new Error(response.message || 'Failed to submit exam')
      }
    } catch (err) {
      console.error('Error submitting exam:', err)
      alert('Failed to submit exam: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < Object.keys(exam.questions).length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💻</div>
          <h2>Loading Coding Exam...</h2>
          <div style={{ marginTop: '2rem' }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h2>Error Loading Exam</h2>
          <p style={{ color: '#dc2626', marginBottom: '2rem' }}>{error}</p>
          <button onClick={fetchExam} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
          <h2>Exam Not Found</h2>
          <p style={{ color: '#6b7280' }}>The requested coding exam could not be found.</p>
        </div>
      </div>
    )
  }

  const questionKeys = Object.keys(exam.questions)
  const currentQuestionKey = questionKeys[currentQuestion]
  const question = exam.questions[currentQuestionKey]

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            {exam.examName}
          </h1>
          <p style={{ color: '#6b7280' }}>
            Question {currentQuestion + 1} of {questionKeys.length}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Problem Statement */}
          <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Problem Statement
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#374151', lineHeight: '1.6' }}>
                {question.question}
              </p>
            </div>

            {(question.sampleInputs && question.sampleInputs.length > 0) && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                  Sample Test Cases
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {question.sampleInputs.map((input, index) => (
                    <div key={index} style={{
                      background: '#ffffff',
                      padding: '1rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #d1d5db'
                    }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                        Test Case {index + 1}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: '#6b7280' }}>
                            Input:
                          </div>
                          <pre style={{
                            background: '#f9fafb',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #e5e7eb',
                            fontSize: '0.75rem',
                            color: '#374151',
                            overflow: 'auto',
                            margin: 0
                          }}>
                            {input}
                          </pre>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: '#6b7280' }}>
                            Expected Output:
                          </div>
                          <pre style={{
                            background: '#f9fafb',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #e5e7eb',
                            fontSize: '0.75rem',
                            color: '#374151',
                            overflow: 'auto',
                            margin: 0
                          }}>
                            {question.sampleOutputs?.[index] || ''}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>Language:</label>
              <select
                value={questionLanguages[currentQuestionKey] || 'javascript'}
                onChange={(e) => setQuestionLanguages(prev => ({...prev, [currentQuestionKey]: e.target.value}))}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  background: '#ffffff'
                }}
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Editor */}
            <div style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <Editor
                height="400px"
                language={questionLanguages[currentQuestionKey] || 'javascript'}
                value={codes[currentQuestionKey] || ''}
                onChange={(value) => setCodes(prev => ({...prev, [currentQuestionKey]: value}))}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Run Button */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={runCode}
                disabled={running}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {running ? 'Running...' : 'Run Code'}
              </button>
            </div>

            {/* Run Result */}
            {runResult && (
              <div style={{
                padding: '1rem',
                borderRadius: '0.25rem',
                background: runResult.success ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${runResult.success ? '#10b981' : '#ef4444'}`
              }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', color: runResult.success ? '#065f46' : '#991b1b' }}>
                  {runResult.overallVerdict === 'Accepted' ? 'All Tests Passed' : 'Some Tests Failed'}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Passed: {runResult.passedCount}/{runResult.totalTests} tests ({runResult.successRate}%)
                </p>

                {/* Test Results */}
                {runResult.testResults && runResult.testResults.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                      Test Results:
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {runResult.testResults.map((test, index) => (
                        <div key={index} style={{
                          background: '#ffffff',
                          padding: '0.75rem',
                          borderRadius: '0.25rem',
                          border: `1px solid ${test.passed ? '#10b981' : '#ef4444'}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                              Test Case {test.testCase}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: test.passed ? '#065f46' : '#991b1b',
                              background: test.passed ? '#d1fae5' : '#fee2e2',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem'
                            }}>
                              {test.verdict}
                            </span>
                          </div>

                          {test.output && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: '#6b7280' }}>
                                Your Output:
                              </div>
                              <pre style={{
                                fontSize: '0.75rem',
                                color: '#374151',
                                background: '#f9fafb',
                                padding: '0.5rem',
                                borderRadius: '0.25rem',
                                border: '1px solid #e5e7eb',
                                overflow: 'auto',
                                margin: 0
                              }}>
                                {test.output}
                              </pre>
                            </div>
                          )}

                          {test.error && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: '#dc2626' }}>
                                Error:
                              </div>
                              <p style={{ fontSize: '0.75rem', color: '#dc2626', margin: 0 }}>
                                {test.error}
                              </p>
                            </div>
                          )}

                          {(test.executionTime || test.memory) && (
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                              Time: {test.executionTime} | Memory: {test.memory}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {runResult.error && !runResult.testResults && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                    {runResult.error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation and Submit */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="btn-outline"
            >
              Previous
            </button>
            <button
              onClick={nextQuestion}
              disabled={currentQuestion === questionKeys.length - 1}
              className="btn-outline"
            >
              Next
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/nextgen/coding-exams')}
              className="btn-secondary"
            >
              Back to Exams
            </button>
            <button
              onClick={submitExam}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
