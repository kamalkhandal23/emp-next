import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Results() {
  const [selectedResult, setSelectedResult] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // Mock student results data
  const studentInfo = {
    name: 'Priya Sharma',
    studentId: 'NGE2024001',
    course: 'Full Stack Development',
    batch: 'Batch 2024-A',
    overallGrade: 'A',
    overallPercentage: 87.5
  }

  const results = [
    {
      id: 1,
      examTitle: 'JavaScript Fundamentals',
      module: 'Module 1',
      date: '2024-01-15',
      score: 92,
      maxScore: 100,
      percentage: 92,
      status: 'passed',
      timeSpent: '45 minutes',
      attempts: 1,
      feedback: 'Excellent understanding of JavaScript concepts. Strong performance in array methods and functions.',
      questions: {
        total: 20,
        correct: 18,
        incorrect: 2,
        skipped: 0
      },
      topicWise: [
        { topic: 'Variables & Data Types', score: 95 },
        { topic: 'Functions', score: 90 },
        { topic: 'Arrays & Objects', score: 88 },
        { topic: 'DOM Manipulation', score: 95 }
      ]
    },
    {
      id: 2,
      examTitle: 'React Components & Props',
      module: 'Module 2',
      date: '2024-01-22',
      score: 85,
      maxScore: 100,
      percentage: 85,
      status: 'passed',
      timeSpent: '52 minutes',
      attempts: 1,
      feedback: 'Good grasp of React components. Need to improve understanding of prop drilling and component lifecycle.',
      questions: {
        total: 25,
        correct: 21,
        incorrect: 3,
        skipped: 1
      },
      topicWise: [
        { topic: 'Component Creation', score: 90 },
        { topic: 'Props & State', score: 80 },
        { topic: 'Event Handling', score: 85 },
        { topic: 'Conditional Rendering', score: 88 }
      ]
    },
    {
      id: 3,
      examTitle: 'State Management with Redux',
      module: 'Module 3',
      date: '2024-01-29',
      score: 78,
      maxScore: 100,
      percentage: 78,
      status: 'passed',
      timeSpent: '58 minutes',
      attempts: 2,
      feedback: 'Satisfactory performance. Redux concepts need more practice. Focus on actions and reducers.',
      questions: {
        total: 30,
        correct: 23,
        incorrect: 5,
        skipped: 2
      },
      topicWise: [
        { topic: 'Redux Store', score: 75 },
        { topic: 'Actions & Reducers', score: 70 },
        { topic: 'Middleware', score: 80 },
        { topic: 'React-Redux Integration', score: 85 }
      ]
    },
    {
      id: 4,
      examTitle: 'Node.js & Express Basics',
      module: 'Module 4',
      date: '2024-02-05',
      score: 88,
      maxScore: 100,
      percentage: 88,
      status: 'passed',
      timeSpent: '48 minutes',
      attempts: 1,
      feedback: 'Strong understanding of server-side concepts. Excellent work on API development and middleware.',
      questions: {
        total: 22,
        correct: 19,
        incorrect: 2,
        skipped: 1
      },
      topicWise: [
        { topic: 'Node.js Fundamentals', score: 90 },
        { topic: 'Express Framework', score: 85 },
        { topic: 'API Development', score: 92 },
        { topic: 'Middleware', score: 85 }
      ]
    },
    {
      id: 5,
      examTitle: 'Database Integration (MongoDB)',
      module: 'Module 5',
      date: '2024-02-12',
      score: 82,
      maxScore: 100,
      percentage: 82,
      status: 'passed',
      timeSpent: '55 minutes',
      attempts: 1,
      feedback: 'Good understanding of database operations. Practice more complex queries and aggregation.',
      questions: {
        total: 28,
        correct: 23,
        incorrect: 4,
        skipped: 1
      },
      topicWise: [
        { topic: 'MongoDB Basics', score: 85 },
        { topic: 'CRUD Operations', score: 80 },
        { topic: 'Mongoose ODM', score: 78 },
        { topic: 'Database Design', score: 85 }
      ]
    },
    {
      id: 6,
      examTitle: 'Final Project Assessment',
      module: 'Final Project',
      date: '2024-02-19',
      score: 0,
      maxScore: 100,
      percentage: 0,
      status: 'pending',
      timeSpent: 'N/A',
      attempts: 0,
      feedback: 'Assessment scheduled for next week.',
      questions: {
        total: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0
      },
      topicWise: []
    }
  ]

  const filteredResults = results.filter(result => {
    if (filterStatus === 'all') return true
    return result.status === filterStatus
  })

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date)
      case 'score':
        return b.percentage - a.percentage
      case 'title':
        return a.examTitle.localeCompare(b.examTitle)
      default:
        return 0
    }
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return { bg: '#dcfce7', color: '#15803d', border: '#22c55e' }
      case 'failed':
        return { bg: '#fef2f2', color: '#dc2626', border: '#ef4444' }
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' }
    }
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#22c55e'
    if (percentage >= 80) return '#3b82f6'
    if (percentage >= 70) return '#f59e0b'
    return '#ef4444'
  }

  if (selectedResult) {
    const result = results.find(r => r.id === selectedResult)
    const statusStyle = getStatusColor(result.status)

    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#374151' }}>
                {result.examTitle}
              </h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
                {result.module} • {new Date(result.date).toLocaleDateString()}
              </p>
            </div>
            <button 
              onClick={() => setSelectedResult(null)}
              className="btn-secondary"
            >
              ← Back to Results
            </button>
          </div>

          {/* Score Overview */}
          <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
            <div className="service-card" style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '700', 
                color: getGradeColor(result.percentage),
                marginBottom: '0.5rem'
              }}>
                {result.percentage}%
              </div>
              <div style={{ color: '#6b7280' }}>Final Score</div>
            </div>
            <div className="service-card" style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '700', 
                color: '#3b82f6',
                marginBottom: '0.5rem'
              }}>
                {result.questions.correct}/{result.questions.total}
              </div>
              <div style={{ color: '#6b7280' }}>Correct Answers</div>
            </div>
            <div className="service-card" style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '700', 
                color: '#8b5cf6',
                marginBottom: '0.5rem'
              }}>
                {result.timeSpent}
              </div>
              <div style={{ color: '#6b7280' }}>Time Spent</div>
            </div>
            <div className="service-card" style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '700', 
                color: '#f59e0b',
                marginBottom: '0.5rem'
              }}>
                {result.attempts}
              </div>
              <div style={{ color: '#6b7280' }}>Attempts</div>
            </div>
          </div>

          <div className="services-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            {/* Detailed Analysis */}
            <div>
              {/* Question Breakdown */}
              <div className="service-card" style={{ marginBottom: '2rem' }}>
                <h3 className="service-title">Question Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>
                      {result.questions.correct}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#15803d' }}>Correct</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
                      {result.questions.incorrect}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>Incorrect</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                      {result.questions.skipped}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#92400e' }}>Skipped</div>
                  </div>
                </div>
              </div>

              {/* Topic-wise Performance */}
              {result.topicWise.length > 0 && (
                <div className="service-card" style={{ marginBottom: '2rem' }}>
                  <h3 className="service-title">Topic-wise Performance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {result.topicWise.map((topic, index) => (
                      <div key={index}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ fontWeight: '500', color: '#374151' }}>{topic.topic}</span>
                          <span style={{ 
                            fontWeight: '600', 
                            color: getGradeColor(topic.score)
                          }}>
                            {topic.score}%
                          </span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          background: '#e5e7eb', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${topic.score}%`, 
                            height: '100%', 
                            background: `linear-gradient(90deg, ${getGradeColor(topic.score)}, ${getGradeColor(topic.score)}dd)`,
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Feedback */}
              <div className="service-card">
                <h3 className="service-title">Instructor Feedback</h3>
                <div style={{ 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  fontStyle: 'italic',
                  color: '#374151',
                  lineHeight: '1.6'
                }}>
                  "{result.feedback}"
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Status */}
              <div className="service-card" style={{ marginBottom: '2rem' }}>
                <h3 className="service-title">Exam Status</h3>
                <div style={{
                  background: statusStyle.bg,
                  border: `2px solid ${statusStyle.border}`,
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>
                    {result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏳'}
                  </div>
                  <div style={{ 
                    fontWeight: '600', 
                    color: statusStyle.color,
                    textTransform: 'capitalize'
                  }}>
                    {result.status}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="service-card">
                <h3 className="service-title">Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {result.status === 'failed' && (
                    <Link to="/nextgen/exam" className="btn-primary">
                      Retake Exam
                    </Link>
                  )}
                  <button className="btn-secondary">
                    Download Certificate
                  </button>
                  <button className="btn-outline">
                    View Answer Sheet
                  </button>
                  <button className="btn-outline">
                    Share Result
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Exam Results
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Track your progress and performance across all assessments
          </p>
        </div>

        {/* Student Overview */}
        <div className="service-card" style={{ 
          background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          border: '2px solid #3b82f6',
          marginBottom: '3rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, color: '#1e40af' }}>{studentInfo.name}</h2>
              <p style={{ margin: '0.5rem 0', color: '#1e3a8a' }}>
                {studentInfo.studentId} • {studentInfo.course} • {studentInfo.batch}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1d4ed8' }}>
                {studentInfo.overallGrade}
              </div>
              <div style={{ color: '#1e40af', fontWeight: '600' }}>
                {studentInfo.overallPercentage}% Overall
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Filter by Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="all">All Results</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="date">Date</option>
              <option value="score">Score</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="services-grid">
          {sortedResults.map((result) => {
            const statusStyle = getStatusColor(result.status)
            
            return (
              <div 
                key={result.id} 
                className="service-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedResult(result.id)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 className="service-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                      {result.examTitle}
                    </h3>
                    <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                      {result.module}
                    </p>
                  </div>
                  <div style={{
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {result.status}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: getGradeColor(result.percentage)
                  }}>
                    {result.percentage}%
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#6b7280' }}>
                    <div>{result.score}/{result.maxScore}</div>
                    <div>{new Date(result.date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1rem'
                }}>
                  <span>Time: {result.timeSpent}</span>
                  <span>Attempts: {result.attempts}</span>
                </div>

                <button 
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  View Details
                </button>
              </div>
            )
          })}
        </div>

        {sortedResults.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3>No results found</h3>
            <p>No exam results match your current filter criteria.</p>
          </div>
        )}

        {/* Performance Summary */}
        <div className="service-card" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">Performance Summary</h2>
          <div className="services-grid">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#22c55e' }}>
                {results.filter(r => r.status === 'passed').length}
              </div>
              <div style={{ color: '#6b7280' }}>Exams Passed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>
                {Math.round(results.filter(r => r.status !== 'pending').reduce((acc, r) => acc + r.percentage, 0) / results.filter(r => r.status !== 'pending').length) || 0}%
              </div>
              <div style={{ color: '#6b7280' }}>Average Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b' }}>
                {results.filter(r => r.status === 'pending').length}
              </div>
              <div style={{ color: '#6b7280' }}>Pending Exams</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                {Math.max(...results.filter(r => r.status !== 'pending').map(r => r.percentage)) || 0}%
              </div>
              <div style={{ color: '#6b7280' }}>Highest Score</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '3rem',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/nextgen/exam" className="btn-primary">
            Take Next Exam
          </Link>
          <Link to="/nextgen/login" className="btn-secondary">
            Back to Dashboard
          </Link>
          <button className="btn-outline">
            Download All Results
          </button>
        </div>
      </div>
    </div>
  )
}