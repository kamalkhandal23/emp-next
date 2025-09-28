import { useState, useEffect } from 'react'
import apiClient from '../utils/api'

export default function WorkLogModal({ isOpen, onClose, onSubmit }) {
  const [workLog, setWorkLog] = useState({
    task: '',
    description: '',
    hoursSpent: '',
    category: 'development',
    project: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const categories = [
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'research', label: 'Research' },
    { value: 'bug-fix', label: 'Bug Fix' },
    { value: 'code-review', label: 'Code Review' },
    { value: 'training', label: 'Training' },
    { value: 'other', label: 'Other' }
  ]

  // Load projects when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProjects()
    }
  }, [isOpen])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const response = await apiClient.request('/projects')
      setProjects(response || [])
      
      // Set default project to General Work if available
      const generalWork = response?.find(p => p.name === 'General Work')
      if (generalWork && !workLog.project) {
        setWorkLog(prev => ({ ...prev, project: generalWork._id }))
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
      // Set a fallback project list
      setProjects([
        { _id: '68d60000a8336a676158d569', name: 'General Work' },
        { _id: '68d60000a8336a676158d56f', name: 'Employee Portal Development' },
        { _id: '68d60000a8336a676158d573', name: 'Training and Development' }
      ])
      setWorkLog(prev => ({ ...prev, project: '68d60000a8336a676158d569' }))
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSubmit(workLog)
      setWorkLog({
        task: '',
        description: '',
        hoursSpent: '',
        category: 'development',
        project: projects.find(p => p.name === 'General Work')?._id || projects[0]?._id || '',
        date: new Date().toISOString().split('T')[0]
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit work log:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Add Work Log</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project</label>
            <select
              value={workLog.project}
              onChange={(e) => setWorkLog({ ...workLog, project: e.target.value })}
              className="form-input"
              required
              disabled={loadingProjects}
            >
              <option value="">Select a project...</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Task Name</label>
            <input
              type="text"
              value={workLog.task}
              onChange={(e) => setWorkLog({ ...workLog, task: e.target.value })}
              className="form-input"
              placeholder="Enter task name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={workLog.description}
              onChange={(e) => setWorkLog({ ...workLog, description: e.target.value })}
              className="form-input"
              placeholder="Describe what you worked on..."
              rows="4"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hours Spent</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={workLog.hoursSpent}
                onChange={(e) => setWorkLog({ ...workLog, hoursSpent: e.target.value })}
                className="form-input"
                placeholder="2.5"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={workLog.category}
                onChange={(e) => setWorkLog({ ...workLog, category: e.target.value })}
                className="form-input"
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              value={workLog.date}
              onChange={(e) => setWorkLog({ ...workLog, date: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Work Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}