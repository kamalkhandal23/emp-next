import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })

  // Mock data
  const adminStats = {
    totalEmployees: 45,
    activeProjects: 12,
    pendingTasks: 28,
    completedTasks: 156,
    totalRevenue: '₹2,45,000',
    monthlyGrowth: '+12%'
  }

  const recentActivities = [
    { id: 1, action: 'New employee onboarded', user: 'Priya Sharma', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Project milestone completed', user: 'Team Alpha', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'System backup completed', user: 'System', time: '6 hours ago', type: 'success' },
    { id: 4, action: 'Security alert resolved', user: 'IT Team', time: '8 hours ago', type: 'warning' }
  ]

  const systemHealth = {
    serverUptime: '99.9%',
    databaseStatus: 'Healthy',
    backupStatus: 'Completed',
    securityStatus: 'Secure'
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginData.username && loginData.password) {
      setIsLoggedIn(true)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="portal-layout">
        <div className="portal-header">
          <div className="container">
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Portal</h1>
          </div>
        </div>
        
        <div className="portal-content">
          <div className="container" style={{ maxWidth: '400px' }}>
            <div className="portal-card">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                <h2>Admin Login</h2>
                <p style={{ color: '#6b7280' }}>Access the administrative dashboard</p>
              </div>
              
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    className="form-input"
                    placeholder="Enter admin username"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="form-input"
                    placeholder="Enter password"
                    required
                  />
                </div>
                
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Login to Admin Panel
                </button>
              </form>
              
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
                  Demo: username: admin, password: admin123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-layout">
      <div className="portal-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Dashboard</h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>System Administrator Panel</p>
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="btn-secondary"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="portal-nav">
        <div className="portal-nav-links">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`portal-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('employees')}
            className={`portal-nav-link ${activeTab === 'employees' ? 'active' : ''}`}
          >
            Employee Management
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`portal-nav-link ${activeTab === 'projects' ? 'active' : ''}`}
          >
            Project Overview
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`portal-nav-link ${activeTab === 'system' ? 'active' : ''}`}
          >
            System Management
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`portal-nav-link ${activeTab === 'reports' ? 'active' : ''}`}
          >
            Reports & Analytics
          </button>
        </div>
      </div>

      <div className="portal-content">
        <div className="container">
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>System Overview</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{adminStats.totalEmployees}</div>
                  <div className="stat-label">Total Employees</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.activeProjects}</div>
                  <div className="stat-label">Active Projects</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.pendingTasks}</div>
                  <div className="stat-label">Pending Tasks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{adminStats.totalRevenue}</div>
                  <div className="stat-label">Monthly Revenue</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="portal-card">
                  <div className="portal-card-header">
                    <h3 className="portal-card-title">Recent Activities</h3>
                  </div>
                  <div>
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="table-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{activity.action}</div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>by {activity.user}</div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{activity.time}</div>
                        <div className={`status-badge status-${activity.type === 'success' ? 'active' : activity.type === 'warning' ? 'pending' : 'completed'}`}>
                          {activity.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="portal-card">
                  <div className="portal-card-header">
                    <h3 className="portal-card-title">System Health</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Server Uptime</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>{systemHealth.serverUptime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Database</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>{systemHealth.databaseStatus}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Backup Status</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>{systemHealth.backupStatus}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Security</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>{systemHealth.securityStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Employee Management</h2>
                <button className="btn-primary">Add New Employee</button>
              </div>
              
              <div className="data-table">
                <div className="table-header">All Employees</div>
                <div className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', fontWeight: '600', background: '#f8fafc' }}>
                  <div>Name</div>
                  <div>Role</div>
                  <div>Department</div>
                  <div>Status</div>
                  <div>Join Date</div>
                  <div>Actions</div>
                </div>
                {[
                  { name: 'Priya Sharma', role: 'Full Stack Developer', dept: 'Engineering', status: 'active', date: '2024-01-15' },
                  { name: 'Rahul Kumar', role: 'UI/UX Designer', dept: 'Design', status: 'active', date: '2024-01-20' },
                  { name: 'Anita Patel', role: 'Project Manager', dept: 'Management', status: 'active', date: '2024-02-01' },
                  { name: 'Vikram Singh', role: 'DevOps Engineer', dept: 'Engineering', status: 'inactive', date: '2024-01-10' }
                ].map((emp, index) => (
                  <div key={index} className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div style={{ fontWeight: '500' }}>{emp.name}</div>
                    <div>{emp.role}</div>
                    <div>{emp.dept}</div>
                    <div>
                      <span className={`status-badge status-${emp.status}`}>
                        {emp.status}
                      </span>
                    </div>
                    <div>{emp.date}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="action-button">Edit</button>
                      <button className="action-button">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>Project Overview</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Active Projects</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">8</div>
                  <div className="stat-label">Completed This Month</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">3</div>
                  <div className="stat-label">Overdue Projects</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">₹15,45,000</div>
                  <div className="stat-label">Total Project Value</div>
                </div>
              </div>

              <div className="data-table">
                <div className="table-header">All Projects</div>
                <div className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', fontWeight: '600', background: '#f8fafc' }}>
                  <div>Project Name</div>
                  <div>Client</div>
                  <div>Team Lead</div>
                  <div>Status</div>
                  <div>Deadline</div>
                  <div>Actions</div>
                </div>
                {[
                  { name: 'E-commerce Platform', client: 'TechCorp', lead: 'Anita Patel', status: 'active', deadline: '2024-03-15' },
                  { name: 'Mobile Banking App', client: 'FinanceBank', lead: 'Rahul Kumar', status: 'completed', deadline: '2024-02-28' },
                  { name: 'CRM System', client: 'SalesForce Ltd', lead: 'Priya Sharma', status: 'pending', deadline: '2024-04-10' }
                ].map((project, index) => (
                  <div key={index} className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div style={{ fontWeight: '500' }}>{project.name}</div>
                    <div>{project.client}</div>
                    <div>{project.lead}</div>
                    <div>
                      <span className={`status-badge status-${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    <div>{project.deadline}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="action-button primary">View</button>
                      <button className="action-button">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>System Management</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="portal-card">
                  <h3 className="portal-card-title">Database Management</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="action-button primary">Backup Database</button>
                    <button className="action-button">Restore Database</button>
                    <button className="action-button">Optimize Database</button>
                    <button className="action-button">View Logs</button>
                  </div>
                </div>

                <div className="portal-card">
                  <h3 className="portal-card-title">User Management</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="action-button primary">Create User</button>
                    <button className="action-button">Manage Roles</button>
                    <button className="action-button">Reset Passwords</button>
                    <button className="action-button">View Sessions</button>
                  </div>
                </div>

                <div className="portal-card">
                  <h3 className="portal-card-title">Security Settings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="action-button primary">Security Audit</button>
                    <button className="action-button">Update Firewall</button>
                    <button className="action-button">SSL Certificate</button>
                    <button className="action-button">Access Logs</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>Reports & Analytics</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="portal-card">
                  <h3 className="portal-card-title">Employee Reports</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="action-button primary">Attendance Report</button>
                    <button className="action-button">Performance Report</button>
                    <button className="action-button">Payroll Report</button>
                    <button className="action-button">Leave Report</button>
                  </div>
                </div>

                <div className="portal-card">
                  <h3 className="portal-card-title">Project Reports</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="action-button primary">Project Status</button>
                    <button className="action-button">Time Tracking</button>
                    <button className="action-button">Budget Analysis</button>
                    <button className="action-button">Client Reports</button>
                  </div>
                </div>

                <div className="portal-card">
                  <h3 className="portal-card-title">Financial Reports</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="action-button primary">Revenue Report</button>
                    <button className="action-button">Expense Report</button>
                    <button className="action-button">Profit & Loss</button>
                    <button className="action-button">Tax Reports</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}