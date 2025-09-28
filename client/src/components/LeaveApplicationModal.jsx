import { useState } from 'react'

export default function LeaveApplicationModal({ isOpen, onClose, onSubmit, leaveBalance }) {
  const [leaveApplication, setLeaveApplication] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: 'morning'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', balance: leaveBalance?.annual?.remaining || 0 },
    { value: 'sick', label: 'Sick Leave', balance: leaveBalance?.sick?.remaining || 0 },
    { value: 'personal', label: 'Personal Leave', balance: leaveBalance?.personal?.remaining || 0 },
    { value: 'maternity', label: 'Maternity Leave', balance: leaveBalance?.maternity?.remaining || 0 },
    { value: 'paternity', label: 'Paternity Leave', balance: leaveBalance?.paternity?.remaining || 0 },
    { value: 'emergency', label: 'Emergency Leave', balance: leaveBalance?.emergency?.remaining || 0 }
  ]

  const calculateDays = () => {
    if (!leaveApplication.startDate || !leaveApplication.endDate) return 0
    
    const start = new Date(leaveApplication.startDate)
    const end = new Date(leaveApplication.endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    
    return leaveApplication.isHalfDay ? 0.5 : diffDays
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const days = calculateDays()
      const selectedType = leaveTypes.find(type => type.value === leaveApplication.type)
      
      if (days > selectedType.balance) {
        setError(`Insufficient ${selectedType.label.toLowerCase()} balance. Available: ${selectedType.balance} days`)
        setLoading(false)
        return
      }

      if (new Date(leaveApplication.startDate) > new Date(leaveApplication.endDate)) {
        setError('End date must be after start date')
        setLoading(false)
        return
      }

      await onSubmit({
        ...leaveApplication,
        days
      })
      
      setLeaveApplication({
        type: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
        isHalfDay: false,
        halfDayPeriod: 'morning'
      })
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to submit leave application')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const days = calculateDays()
  const selectedType = leaveTypes.find(type => type.value === leaveApplication.type)

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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Apply for Leave</h2>
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

        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#dc2626',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select
              value={leaveApplication.type}
              onChange={(e) => setLeaveApplication({ ...leaveApplication, type: e.target.value })}
              className="form-input"
              required
            >
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} (Available: {type.balance} days)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={leaveApplication.isHalfDay}
                onChange={(e) => setLeaveApplication({ 
                  ...leaveApplication, 
                  isHalfDay: e.target.checked,
                  endDate: e.target.checked ? leaveApplication.startDate : leaveApplication.endDate
                })}
              />
              <span className="form-label" style={{ margin: 0 }}>Half Day Leave</span>
            </label>
          </div>

          {leaveApplication.isHalfDay && (
            <div className="form-group">
              <label className="form-label">Half Day Period</label>
              <select
                value={leaveApplication.halfDayPeriod}
                onChange={(e) => setLeaveApplication({ ...leaveApplication, halfDayPeriod: e.target.value })}
                className="form-input"
              >
                <option value="morning">Morning (First Half)</option>
                <option value="afternoon">Afternoon (Second Half)</option>
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={leaveApplication.startDate}
                onChange={(e) => setLeaveApplication({ 
                  ...leaveApplication, 
                  startDate: e.target.value,
                  endDate: leaveApplication.isHalfDay ? e.target.value : leaveApplication.endDate
                })}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={leaveApplication.endDate}
                onChange={(e) => setLeaveApplication({ ...leaveApplication, endDate: e.target.value })}
                className="form-input"
                min={leaveApplication.startDate || new Date().toISOString().split('T')[0]}
                disabled={leaveApplication.isHalfDay}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Leave</label>
            <textarea
              value={leaveApplication.reason}
              onChange={(e) => setLeaveApplication({ ...leaveApplication, reason: e.target.value })}
              className="form-input"
              placeholder="Please provide a reason for your leave request..."
              rows="4"
              required
            />
          </div>

          {/* Leave Summary */}
          <div style={{
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>Leave Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: '#6b7280' }}>Type:</span> {selectedType?.label}
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Duration:</span> {days} day{days !== 1 ? 's' : ''}
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Available Balance:</span> {selectedType?.balance} days
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Remaining After:</span> {selectedType?.balance - days} days
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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
              disabled={loading || days > selectedType?.balance}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}