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
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
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
      const questionKey = Object.keys(exam.questions)[currentQuestion]
      const question = exam.questions[questionKey]
      setCode(defaultCode[language] || '')
      setRunResult(null)
    }
  }, [currentQuestion, language, exam])

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
        code,
        language
      })

      if (response.success) {
        const result = response.data
        setRunResult({
          success: result.verdict === 'Accepted',
          output: result.output,
          error: result.error,
          executionTime: result.executionTime,
          memory: result.memory,
          verdict: result.verdict
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
      // Mock submission - in real implementation, send all code to backend
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate to results page
      navigate('/nextgen/results')
    } catch (err) {
      console.error('Error submitting exam:', err)
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

            {question.testCase && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                  Sample Test Cases
                </h4>
                <pre style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  color: '#374151',
                  overflow: 'auto'
                }}>
                  {question.testCase}
                </pre>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
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
                language={language}
                value={code}
                onChange={setCode}
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
                  {runResult.success ? 'Execution Successful' : 'Execution Failed'}
                </h4>
                {runResult.output && (
                  <pre style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    background: '#ffffff',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    overflow: 'auto',
                    marginBottom: '0.5rem'
                  }}>
                    {runResult.output}
                  </pre>
                )}
                {runResult.error && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                    {runResult.error}
                  </p>
                )}
                {runResult.executionTime && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Time: {runResult.executionTime} | Memory: {runResult.memory}
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
