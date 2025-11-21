import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeamLeadPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!authToken || !userRole) {
      navigate('/login', { replace: true });
    }
  }, []);

  // Mock data
  const teamStats = {
    teamMembers: 8,
    activeTasks: 15,
    completedTasks: 42,
    overdueTasks: 3,
    teamEfficiency: '87%',
    avgWorkHours: '8.2h',
  };

  const teamMembers = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Senior Developer',
      status: 'online',
      checkIn: '09:15 AM',
      checkOut: 'Active',
      hours: '7h 45m',
      tasks: 3,
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      role: 'Frontend Developer',
      status: 'online',
      checkIn: '09:00 AM',
      checkOut: 'Active',
      hours: '8h 00m',
      tasks: 2,
    },
    {
      id: 3,
      name: 'Sneha Reddy',
      role: 'Backend Developer',
      status: 'offline',
      checkIn: '09:30 AM',
      checkOut: '06:15 PM',
      hours: '8h 45m',
      tasks: 4,
    },
    {
      id: 4,
      name: 'Amit Patel',
      role: 'QA Engineer',
      status: 'online',
      checkIn: '08:45 AM',
      checkOut: 'Active',
      hours: '8h 15m',
      tasks: 2,
    },
  ];

  const tasks = [
    {
      id: 1,
      title: 'User Authentication Module',
      assignee: 'Priya Sharma',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-02-22',
      progress: 75,
    },
    {
      id: 2,
      title: 'Payment Gateway Integration',
      assignee: 'Rahul Kumar',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-02-25',
      progress: 30,
    },
    {
      id: 3,
      title: 'Database Optimization',
      assignee: 'Sneha Reddy',
      priority: 'medium',
      status: 'completed',
      dueDate: '2024-02-20',
      progress: 100,
    },
    {
      id: 4,
      title: 'API Testing Suite',
      assignee: 'Amit Patel',
      priority: 'medium',
      status: 'in-progress',
      dueDate: '2024-02-24',
      progress: 60,
    },
    {
      id: 5,
      title: 'Mobile Responsive Design',
      assignee: 'Rahul Kumar',
      priority: 'low',
      status: 'pending',
      dueDate: '2024-02-28',
      progress: 10,
    },
  ];

  const projectProgress = {
    projectName: 'E-commerce Platform',
    overallProgress: 68,
    phases: [
      { name: 'Planning', progress: 100, status: 'completed' },
      { name: 'Design', progress: 100, status: 'completed' },
      { name: 'Development', progress: 75, status: 'in-progress' },
      { name: 'Testing', progress: 40, status: 'in-progress' },
      { name: 'Deployment', progress: 0, status: 'pending' },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

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
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              Team Lead Dashboard
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>
              Engineering Team Management
            </p>
          </div>
          <button
            onClick={handleLogout}
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
            onClick={() => setActiveTab('team')}
            className={`portal-nav-link ${
              activeTab === 'team' ? 'active' : ''
            }`}>
            Team Management
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`portal-nav-link ${
              activeTab === 'tasks' ? 'active' : ''
            }`}>
            Task Management
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`portal-nav-link ${
              activeTab === 'progress' ? 'active' : ''
            }`}>
            Project Progress
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`portal-nav-link ${
              activeTab === 'attendance' ? 'active' : ''
            }`}>
            Team Attendance
          </button>
        </div>
      </div>

      <div className='portal-content'>
        <div className='container'>
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>Team Overview</h2>

              <div className='stats-grid'>
                <div className='stat-card'>
                  <div className='stat-number'>{teamStats.teamMembers}</div>
                  <div className='stat-label'>Team Members</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{teamStats.activeTasks}</div>
                  <div className='stat-label'>Active Tasks</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{teamStats.completedTasks}</div>
                  <div className='stat-label'>Completed Tasks</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{teamStats.teamEfficiency}</div>
                  <div className='stat-label'>Team Efficiency</div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '2rem',
                }}>
                <div className='portal-card'>
                  <div className='portal-card-header'>
                    <h3 className='portal-card-title'>Team Status</h3>
                  </div>
                  <div>
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className='table-row'
                        style={{
                          gridTemplateColumns: '2fr 1fr 1fr',
                          padding: '1rem 0',
                        }}>
                        <div>
                          <div
                            style={{
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}>
                            {member.name}
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background:
                                  member.status === 'online'
                                    ? '#22c55e'
                                    : '#6b7280',
                              }}
                            />
                          </div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {member.role}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div>Hours: {member.hours}</div>
                          <div>Tasks: {member.tasks}</div>
                        </div>
                        <div>
                          <span
                            className={`status-badge status-${
                              member.status === 'online' ? 'active' : 'inactive'
                            }`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='portal-card'>
                  <div className='portal-card-header'>
                    <h3 className='portal-card-title'>Project Progress</h3>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#3b82f6',
                      }}>
                      {projectProgress.overallProgress}%
                    </div>
                    <div style={{ color: '#6b7280' }}>
                      {projectProgress.projectName}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    {projectProgress.phases.map((phase, index) => (
                      <div key={index}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.25rem',
                          }}>
                          <span
                            style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                            {phase.name}
                          </span>
                          <span
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {phase.progress}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            background: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}>
                          <div
                            style={{
                              width: `${phase.progress}%`,
                              height: '100%',
                              background:
                                phase.status === 'completed'
                                  ? '#22c55e'
                                  : phase.status === 'in-progress'
                                  ? '#3b82f6'
                                  : '#e5e7eb',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Team Management</h2>
                <button className='btn-primary'>Add Team Member</button>
              </div>

              <div className='data-table'>
                <div className='table-header'>Team Members</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: '600',
                    background: '#f8fafc',
                  }}>
                  <div>Name & Role</div>
                  <div>Status</div>
                  <div>Check In</div>
                  <div>Hours Today</div>
                  <div>Active Tasks</div>
                  <div>Actions</div>
                </div>
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{member.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {member.role}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`status-badge status-${
                          member.status === 'online' ? 'active' : 'inactive'
                        }`}>
                        {member.status}
                      </span>
                    </div>
                    <div>{member.checkIn}</div>
                    <div>{member.hours}</div>
                    <div>{member.tasks}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className='action-button primary'>View</button>
                      <button className='action-button'>Message</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Task Management</h2>
                <button className='btn-primary'>Assign New Task</button>
              </div>

              <div className='stats-grid'>
                <div className='stat-card'>
                  <div className='stat-number'>{teamStats.activeTasks}</div>
                  <div className='stat-label'>Active Tasks</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{teamStats.completedTasks}</div>
                  <div className='stat-label'>Completed</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{teamStats.overdueTasks}</div>
                  <div className='stat-label'>Overdue</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>5</div>
                  <div className='stat-label'>In Review</div>
                </div>
              </div>

              <div className='data-table'>
                <div className='table-header'>All Tasks</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: '600',
                    background: '#f8fafc',
                  }}>
                  <div>Task</div>
                  <div>Assignee</div>
                  <div>Priority</div>
                  <div>Status</div>
                  <div>Progress</div>
                  <div>Actions</div>
                </div>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{task.title}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Due: {task.dueDate}
                      </div>
                    </div>
                    <div>{task.assignee}</div>
                    <div>
                      <span
                        style={{
                          color: getPriorityColor(task.priority),
                          fontWeight: '600',
                          fontSize: '0.875rem',
                        }}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`status-badge status-${
                          task.status === 'completed'
                            ? 'active'
                            : task.status === 'in-progress'
                            ? 'completed'
                            : 'pending'
                        }`}>
                        {task.status}
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                        <div
                          style={{
                            width: '60px',
                            height: '6px',
                            background: '#e5e7eb',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}>
                          <div
                            style={{
                              width: `${task.progress}%`,
                              height: '100%',
                              background: '#3b82f6',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.875rem' }}>
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className='action-button primary'>Edit</button>
                      <button className='action-button'>View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>
                Project Progress Tracking
              </h2>

              <div className='portal-card' style={{ marginBottom: '2rem' }}>
                <div className='portal-card-header'>
                  <h3 className='portal-card-title'>
                    {projectProgress.projectName}
                  </h3>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#3b82f6',
                    }}>
                    {projectProgress.overallProgress}% Complete
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                  }}>
                  {projectProgress.phases.map((phase, index) => (
                    <div key={index} className='stat-card'>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem',
                        }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>
                          {phase.name}
                        </h4>
                        <span
                          className={`status-badge status-${
                            phase.status === 'completed'
                              ? 'active'
                              : phase.status === 'in-progress'
                              ? 'completed'
                              : 'pending'
                          }`}>
                          {phase.status}
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '8px',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginBottom: '0.5rem',
                        }}>
                        <div
                          style={{
                            width: `${phase.progress}%`,
                            height: '100%',
                            background:
                              phase.status === 'completed'
                                ? '#22c55e'
                                : phase.status === 'in-progress'
                                ? '#3b82f6'
                                : '#e5e7eb',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#374151',
                        }}>
                        {phase.progress}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                }}>
                <div className='portal-card'>
                  <h3 className='portal-card-title'>Team Performance</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{member.name}</div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {member.tasks} active tasks
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '600', color: '#22c55e' }}>
                            95%
                          </div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Efficiency
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='portal-card'>
                  <h3 className='portal-card-title'>Upcoming Milestones</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    {[
                      {
                        title: 'Beta Release',
                        date: '2024-02-25',
                        status: 'on-track',
                      },
                      {
                        title: 'User Testing',
                        date: '2024-03-01',
                        status: 'pending',
                      },
                      {
                        title: 'Final Deployment',
                        date: '2024-03-15',
                        status: 'pending',
                      },
                    ].map((milestone, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {milestone.title}
                          </div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {milestone.date}
                          </div>
                        </div>
                        <span
                          className={`status-badge status-${
                            milestone.status === 'on-track'
                              ? 'active'
                              : 'pending'
                          }`}>
                          {milestone.status}
                        </span>
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
                <h2>Team Attendance</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className='action-button'>Export Report</button>
                  <button className='btn-primary'>View Calendar</button>
                </div>
              </div>

              <div className='stats-grid'>
                <div className='stat-card'>
                  <div className='stat-number'>7/8</div>
                  <div className='stat-label'>Present Today</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{teamStats.avgWorkHours}</div>
                  <div className='stat-label'>Avg Work Hours</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>1</div>
                  <div className='stat-label'>On Leave</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>95%</div>
                  <div className='stat-label'>Attendance Rate</div>
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
                  <div>Team Member</div>
                  <div>Check In</div>
                  <div>Check Out</div>
                  <div>Hours</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{member.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {member.role}
                      </div>
                    </div>
                    <div>{member.checkIn}</div>
                    <div>{member.checkOut}</div>
                    <div>{member.hours}</div>
                    <div>
                      <span
                        className={`status-badge status-${
                          member.status === 'online' ? 'active' : 'inactive'
                        }`}>
                        {member.status === 'online' ? 'present' : 'absent'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className='action-button'>View History</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
