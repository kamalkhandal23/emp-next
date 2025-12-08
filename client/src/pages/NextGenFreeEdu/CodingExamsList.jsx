import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../../utils/api'

export default function CodingExamsList() {
  const [codingExams, setCodingExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCodingExams()
  }, [])

  const fetchCodingExams = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apiClient.getAllNextGenCodingExams({status: 'published'})

      if (response.success) {
        const exams = response.data.exams || []
        const mappedExams = exams.map(exam => ({
          _id: exam._id,
          title: exam.examName,
          description: exam.courseName || 'Test your coding skills with this challenge.',
          difficulty: 'medium', // Default since not stored in model
          duration: null, // Default since not stored in model
          programmingLanguage: 'Multiple' // Default since not stored in model
        }))
        setCodingExams(mappedExams)
      } else {
        throw new Error(response.message || 'Failed to fetch coding exams')
      }
    } catch (err) {
      console.error('Error fetching coding exams:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const enterFullscreen = () => {
          const elem = document.documentElement;
          if (elem.requestFullscreen) elem.requestFullscreen();
          else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
          else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      };
  

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💻</div>
          <h2>Loading Coding Exams...</h2>
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
          <h2>Error Loading Coding Exams</h2>
          <p style={{ color: '#dc2626', marginBottom: '2rem' }}>{error}</p>
          <button onClick={fetchCodingExams} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💻</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Coding Exams
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Test your programming skills with our coding challenges
          </p>
        </div>

        {/* Exams List */}
        {codingExams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>No Coding Exams Available</h3>
            <p style={{ color: '#9ca3af' }}>Check back later for new coding challenges.</p>
          </div>
        ) : (
          <div className="services-grid">
            {codingExams.map((exam) => (
              <div key={exam._id} className="service-card">
                <h3 className="service-title">{exam.title}</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    {exam.description || 'Test your coding skills with this challenge.'}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Difficulty:</span>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: exam.difficulty === 'easy' ? '#22c55e' :
                             exam.difficulty === 'medium' ? '#f59e0b' : '#ef4444'
                    }}>
                      {exam.difficulty || 'Not specified'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Duration:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      {exam.duration ? `${exam.duration} mins` : 'Not specified'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Language:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      {exam.programmingLanguage || 'Multiple'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link
                    onClick={enterFullscreen}
                    to={`/nextgen/coding-exam/${exam._id}`}
                    className="btn-primary"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Start Exam
                  </Link>
                  <button className="btn-outline" style={{ flex: 1 }}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/nextgen/login" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}