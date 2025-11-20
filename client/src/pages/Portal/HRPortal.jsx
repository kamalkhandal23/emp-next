import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HRPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Mock data
  const hrStats = {
    totalEmployees: 45,
    presentToday: 42,
    onLeave: 3,
    newHires: 5,
    pendingInterviews: 8,
    openPositions: 6,
  };

  const attendanceData = [
    {
      id: 1,
      name: 'Priya Sharma',
      checkIn: '09:15 AM',
      checkOut: '06:30 PM',
      status: 'present',
      hours: '9h 15m',
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      checkIn: '09:00 AM',
      checkOut: '06:45 PM',
      status: 'present',
      hours: '9h 45m',
    },
    {
      id: 3,
      name: 'Anita Patel',
      checkIn: '09:30 AM',
      checkOut: 'Not yet',
      status: 'present',
      hours: '7h 30m',
    },
    {
      id: 4,
      name: 'Vikram Singh',
      checkIn: '-',
      checkOut: '-',
      status: 'leave',
      hours: '0h',
    },
    {
      id: 5,
      name: 'Sneha Reddy',
      checkIn: '08:45 AM',
      checkOut: '05:30 PM',
      status: 'present',
      hours: '8h 45m',
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      candidate: 'Amit Sharma',
      position: 'React Developer',
      date: '2024-02-20',
      time: '10:00 AM',
      interviewer: 'Priya Sharma',
    },
    {
      id: 2,
      candidate: 'Kavya Patel',
      position: 'UI/UX Designer',
      date: '2024-02-20',
      time: '02:00 PM',
      interviewer: 'Rahul Kumar',
    },
    {
      id: 3,
      candidate: 'Ravi Kumar',
      position: 'DevOps Engineer',
      date: '2024-02-21',
      time: '11:00 AM',
      interviewer: 'Vikram Singh',
    },
  ];

  const leaveRequests = [
    {
      id: 1,
      employee: 'Priya Sharma',
      type: 'Sick Leave',
      from: '2024-02-22',
      to: '2024-02-23',
      days: 2,
      status: 'pending',
    },
    {
      id: 2,
      employee: 'Rahul Kumar',
      type: 'Vacation',
      from: '2024-03-01',
      to: '2024-03-05',
      days: 5,
      status: 'approved',
    },
    {
      id: 3,
      employee: 'Anita Patel',
      type: 'Personal',
      from: '2024-02-25',
      to: '2024-02-25',
      days: 1,
      status: 'pending',
    },
  ];

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!token || (userRole !== 'hr' && userRole !== 'admin')) {
      navigate('/login', { replace: true });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className='portal-layout'>
        <div
          className='portal-content'
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
          }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='portal-layout'>
      <div className='portal-header'>
        <div
          className='container'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>HR Dashboard</h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>
              Human Resources Management
            </p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className='btn-secondary'
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            Logout
          </button>
        </div>
      </div>

      <div className='portal-nav'>
        <div className='portal-nav-links'>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`portal-nav-link ${
              activeTab === 'dashboard' ? 'active' : ''
            }`}>
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`portal-nav-link ${
              activeTab === 'attendance' ? 'active' : ''
            }`}>
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`portal-nav-link ${
              activeTab === 'employees' ? 'active' : ''
            }`}>
            Employee Management
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`portal-nav-link ${
              activeTab === 'interviews' ? 'active' : ''
            }`}>
            Interviews
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`portal-nav-link ${
              activeTab === 'leaves' ? 'active' : ''
            }`}>
            Leave Management
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`portal-nav-link ${
              activeTab === 'roster' ? 'active' : ''
            }`}>
            Roster & Schedule
          </button>
        </div>
      </div>

      <div className='portal-content'>
        <div className='container'>
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>HR Overview</h2>

              <div className='stats-grid'>
                <div className='stat-card'>
                  <div className='stat-number'>{hrStats.totalEmployees}</div>
                  <div className='stat-label'>Total Employees</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{hrStats.presentToday}</div>
                  <div className='stat-label'>Present Today</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{hrStats.onLeave}</div>
                  <div className='stat-label'>On Leave</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{hrStats.pendingInterviews}</div>
                  <div className='stat-label'>Pending Interviews</div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                }}>
                <div className='portal-card'>
                  <div className='portal-card-header'>
                    <h3 className='portal-card-title'>Today's Attendance</h3>
                  </div>
                  <div>
                    {attendanceData.slice(0, 5).map((emp) => (
                      <div
                        key={emp.id}
                        className='table-row'
                        style={{
                          gridTemplateColumns: '2fr 1fr 1fr',
                          padding: '0.75rem 0',
                        }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{emp.name}</div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {emp.checkIn} - {emp.checkOut}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                          {emp.hours}
                        </div>
                        <div>
                          <span
                            className={`status-badge status-${
                              emp.status === 'present' ? 'active' : 'pending'
                            }`}>
                            {emp.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='portal-card'>
                  <div className='portal-card-header'>
                    <h3 className='portal-card-title'>Upcoming Interviews</h3>
                  </div>
                  <div>
                    {upcomingInterviews.map((interview) => (
                      <div
                        key={interview.id}
                        className='table-row'
                        style={{
                          gridTemplateColumns: '1fr',
                          padding: '0.75rem 0',
                        }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {interview.candidate}
                          </div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {interview.position} • {interview.date} at{' '}
                            {interview.time}
                          </div>
                          <div
                            style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            Interviewer: {interview.interviewer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Attendance Management</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className='action-button'>Export Report</button>
                  <button className='btn-primary'>Mark Attendance</button>
                </div>
              </div>

              <div className='data-table'>
                <div className='table-header'>
                  Today's Attendance - {new Date().toLocaleDateString()}
                </div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: '600',
                    background: '#f8fafc',
                  }}>
                  <div>Employee</div>
                  <div>Check In</div>
                  <div>Check Out</div>
                  <div>Total Hours</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {attendanceData.map((emp) => (
                  <div
                    key={emp.id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div style={{ fontWeight: '500' }}>{emp.name}</div>
                    <div>{emp.checkIn}</div>
                    <div>{emp.checkOut}</div>
                    <div>{emp.hours}</div>
                    <div>
                      <span
                        className={`status-badge status-${
                          emp.status === 'present' ? 'active' : 'pending'
                        }`}>
                        {emp.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className='action-button'>Edit</button>
                      <button className='action-button'>View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Employee Management</h2>
                <button className='btn-primary'>Add New Employee</button>
              </div>

              <div className='stats-grid'>
                <div className='stat-card'>
                  <div className='stat-number'>45</div>
                  <div className='stat-label'>Total Employees</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>5</div>
                  <div className='stat-label'>New Hires (This Month)</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>2</div>
                  <div className='stat-label'>Resignations</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>6</div>
                  <div className='stat-label'>Open Positions</div>
                </div>
              </div>

              <div className='data-table'>
                <div className='table-header'>Employee Directory</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: '600',
                    background: '#f8fafc',
                  }}>
                  <div>Name</div>
                  <div>Employee ID</div>
                  <div>Department</div>
                  <div>Position</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {[
                  {
                    name: 'Priya Sharma',
                    id: 'EMP001',
                    dept: 'Engineering',
                    position: 'Full Stack Developer',
                    status: 'active',
                  },
                  {
                    name: 'Rahul Kumar',
                    id: 'EMP002',
                    dept: 'Design',
                    position: 'UI/UX Designer',
                    status: 'active',
                  },
                  {
                    name: 'Anita Patel',
                    id: 'EMP003',
                    dept: 'Management',
                    position: 'Project Manager',
                    status: 'active',
                  },
                  {
                    name: 'Vikram Singh',
                    id: 'EMP004',
                    dept: 'Engineering',
                    position: 'DevOps Engineer',
                    status: 'active',
                  },
                ].map((emp, index) => (
                  <div
                    key={index}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div style={{ fontWeight: '500' }}>{emp.name}</div>
                    <div>{emp.id}</div>
                    <div>{emp.dept}</div>
                    <div>{emp.position}</div>
                    <div>
                      <span className={`status-badge status-${emp.status}`}>
                        {emp.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className='action-button primary'>Profile</button>
                      <button className='action-button'>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interviews' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Interview Management</h2>
                <button className='btn-primary'>Schedule Interview</button>
              </div>

              <div className='data-table'>
                <div className='table-header'>Upcoming Interviews</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: '600',
                    background: '#f8fafc',
                  }}>
                  <div>Candidate</div>
                  <div>Position</div>
                  <div>Date</div>
                  <div>Time</div>
                  <div>Interviewer</div>
                  <div>Actions</div>
                </div>
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div style={{ fontWeight: '500' }}>
                      {interview.candidate}
                    </div>
                    <div>{interview.position}</div>
                    <div>{interview.date}</div>
                    <div>{interview.time}</div>
                    <div>{interview.interviewer}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className='action-button primary'>Join</button>
                      <button className='action-button'>Reschedule</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Leave Management</h2>
                <button className='btn-primary'>Leave Policies</button>
              </div>

              <div className='data-table'>
                <div className='table-header'>Leave Requests</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: '600',
                    background: '#f8fafc',
                  }}>
                  <div>Employee</div>
                  <div>Leave Type</div>
                  <div>From</div>
                  <div>To</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {leaveRequests.map((leave) => (
                  <div
                    key={leave.id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div style={{ fontWeight: '500' }}>{leave.employee}</div>
                    <div>{leave.type}</div>
                    <div>{leave.from}</div>
                    <div>{leave.to}</div>
                    <div>
                      <span
                        className={`status-badge status-${
                          leave.status === 'approved' ? 'active' : 'pending'
                        }`}>
                        {leave.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {leave.status === 'pending' && (
                        <>
                          <button className='action-button primary'>
                            Approve
                          </button>
                          <button className='action-button'>Reject</button>
                        </>
                      )}
                      <button className='action-button'>View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roster' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Roster & Schedule Management</h2>
                <button className='btn-primary'>Create Schedule</button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                }}>
                <div className='portal-card'>
                  <h3 className='portal-card-title'>Weekly Roster</h3>
                  <div className='data-table'>
                    <div
                      className='table-row'
                      style={{
                        gridTemplateColumns: '1fr 1fr 1fr',
                        fontWeight: '600',
                        background: '#f8fafc',
                      }}>
                      <div>Employee</div>
                      <div>Shift</div>
                      <div>Days</div>
                    </div>
                    {[
                      {
                        name: 'Priya Sharma',
                        shift: '9 AM - 6 PM',
                        days: 'Mon-Fri',
                      },
                      {
                        name: 'Rahul Kumar',
                        shift: '10 AM - 7 PM',
                        days: 'Mon-Fri',
                      },
                      {
                        name: 'Anita Patel',
                        shift: '9 AM - 6 PM',
                        days: 'Mon-Sat',
                      },
                    ].map((roster, index) => (
                      <div
                        key={index}
                        className='table-row'
                        style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div style={{ fontWeight: '500' }}>{roster.name}</div>
                        <div>{roster.shift}</div>
                        <div>{roster.days}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='portal-card'>
                  <h3 className='portal-card-title'>Upcoming Meetings</h3>
                  <div>
                    {[
                      {
                        title: 'Team Standup',
                        time: '10:00 AM',
                        attendees: 'Engineering Team',
                      },
                      {
                        title: 'Client Review',
                        time: '2:00 PM',
                        attendees: 'Project Team',
                      },
                      {
                        title: 'HR Meeting',
                        time: '4:00 PM',
                        attendees: 'HR Department',
                      },
                    ].map((meeting, index) => (
                      <div
                        key={index}
                        className='table-row'
                        style={{
                          gridTemplateColumns: '1fr',
                          padding: '0.75rem 0',
                        }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {meeting.title}
                          </div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {meeting.time} • {meeting.attendees}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className='btn-primary'
                    style={{ width: '100%', marginTop: '1rem' }}>
                    Schedule New Meeting
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
