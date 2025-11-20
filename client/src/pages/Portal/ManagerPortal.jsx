import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ManagerPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Mock data
  const managerStats = {
    totalTeams: 4,
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    totalRevenue: '₹25,45,000',
    monthlyTarget: '₹30,00,000',
  };

  const teams = [
    {
      id: 1,
      name: 'Engineering Team',
      lead: 'Anita Patel',
      members: 8,
      projects: 3,
      efficiency: 87,
      status: 'active',
    },
    {
      id: 2,
      name: 'Design Team',
      lead: 'Rahul Kumar',
      members: 5,
      projects: 2,
      efficiency: 92,
      status: 'active',
    },
    {
      id: 3,
      name: 'QA Team',
      lead: 'Priya Sharma',
      members: 4,
      projects: 4,
      efficiency: 89,
      status: 'active',
    },
    {
      id: 4,
      name: 'DevOps Team',
      lead: 'Vikram Singh',
      members: 3,
      projects: 2,
      efficiency: 95,
      status: 'active',
    },
  ];

  const projects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      client: 'TechCorp Solutions',
      team: 'Engineering Team',
      progress: 75,
      budget: '₹8,50,000',
      spent: '₹6,37,500',
      deadline: '2024-03-15',
      status: 'on-track',
      priority: 'high',
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      client: 'FinanceBank Ltd',
      team: 'Engineering Team',
      progress: 100,
      budget: '₹12,00,000',
      spent: '₹11,80,000',
      deadline: '2024-02-28',
      status: 'completed',
      priority: 'high',
    },
    {
      id: 3,
      name: 'CRM Dashboard',
      client: 'SalesForce Inc',
      team: 'Design Team',
      progress: 45,
      budget: '₹5,50,000',
      spent: '₹2,47,500',
      deadline: '2024-04-10',
      status: 'at-risk',
      priority: 'medium',
    },
  ];

  const revenueData = [
    { month: 'Jan', target: 2500000, actual: 2750000 },
    { month: 'Feb', target: 3000000, actual: 2545000 },
    { month: 'Mar', target: 3200000, actual: 0 },
  ];

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!token || (userRole !== 'manager' && userRole !== 'admin')) {
      navigate('/login', { replace: true });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'on-track':
        return '#3b82f6';
      case 'at-risk':
        return '#f59e0b';
      case 'delayed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

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
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Manager Dashboard</h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>
              Project & Team Management
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
            onClick={() => setActiveTab('teams')}
            className={`portal-nav-link ${
              activeTab === 'teams' ? 'active' : ''
            }`}>
            Team Management
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`portal-nav-link ${
              activeTab === 'projects' ? 'active' : ''
            }`}>
            Project Overview
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`portal-nav-link ${
              activeTab === 'financials' ? 'active' : ''
            }`}>
            Financial Reports
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`portal-nav-link ${
              activeTab === 'analytics' ? 'active' : ''
            }`}>
            Analytics
          </button>
        </div>
      </div>

      <div className='portal-content'>
        <div className='container'>
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>Executive Overview</h2>

              <div className='stats-grid'>
                <div className='stat-card'>
                  <div className='stat-number'>{managerStats.totalTeams}</div>
                  <div className='stat-label'>Active Teams</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>
                    {managerStats.activeProjects}
                  </div>
                  <div className='stat-label'>Active Projects</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>{managerStats.totalRevenue}</div>
                  <div className='stat-label'>Monthly Revenue</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>85%</div>
                  <div className='stat-label'>Target Achievement</div>
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
                    <h3 className='portal-card-title'>
                      Project Status Overview
                    </h3>
                  </div>
                  <div>
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className='table-row'
                        style={{
                          gridTemplateColumns: '2fr 1fr 1fr',
                          padding: '1rem 0',
                        }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {project.name}
                          </div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {project.client} • {project.team}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              width: '100px',
                              height: '6px',
                              background: '#e5e7eb',
                              borderRadius: '3px',
                              overflow: 'hidden',
                              marginBottom: '0.25rem',
                            }}>
                            <div
                              style={{
                                width: `${project.progress}%`,
                                height: '100%',
                                background: getStatusColor(project.status),
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.875rem' }}>
                            {project.progress}%
                          </div>
                        </div>
                        <div>
                          <span
                            className={`status-badge status-${
                              project.status === 'completed'
                                ? 'active'
                                : project.status === 'on-track'
                                ? 'completed'
                                : 'pending'
                            }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='portal-card'>
                  <div className='portal-card-header'>
                    <h3 className='portal-card-title'>Team Performance</h3>
                  </div>
                  <div>
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className='table-row'
                        style={{
                          gridTemplateColumns: '1fr',
                          padding: '0.75rem 0',
                        }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{team.name}</div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Lead: {team.lead} • {team.members} members
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginTop: '0.5rem',
                            }}>
                            <span style={{ fontSize: '0.875rem' }}>
                              Efficiency
                            </span>
                            <span
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#22c55e',
                              }}>
                              {team.efficiency}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Team Management</h2>
                <button className='btn-primary'>Create New Team</button>
              </div>

              <div className='data-table'>
                <div className='table-header'>All Teams</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: '600',
                    background: '#f8fafc',
                  }}>
                  <div>Team Name</div>
                  <div>Team Lead</div>
                  <div>Members</div>
                  <div>Active Projects</div>
                  <div>Efficiency</div>
                  <div>Actions</div>
                </div>
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{team.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Specialized team for development
                      </div>
                    </div>
                    <div>{team.lead}</div>
                    <div>{team.members}</div>
                    <div>{team.projects}</div>
                    <div>
                      <span
                        style={{
                          color:
                            team.efficiency >= 90
                              ? '#22c55e'
                              : team.efficiency >= 80
                              ? '#3b82f6'
                              : '#f59e0b',
                          fontWeight: '600',
                        }}>
                        {team.efficiency}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className='action-button primary'>View</button>
                      <button className='action-button'>Manage</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2>Project Overview</h2>
                <button className='btn-primary'>New Project</button>
              </div>

              <div className='stats-grid'>
                <div className='stat-card'>
                  <div className='stat-number'>
                    {managerStats.activeProjects}
                  </div>
                  <div className='stat-label'>Active Projects</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>
                    {managerStats.completedProjects}
                  </div>
                  <div className='stat-label'>Completed</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>2</div>
                  <div className='stat-label'>At Risk</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>₹26,00,000</div>
                  <div className='stat-label'>Total Budget</div>
                </div>
              </div>

              <div className='data-table'>
                <div className='table-header'>All Projects</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: '600',
                    background: '#f8fafc',
                  }}>
                  <div>Project Details</div>
                  <div>Team</div>
                  <div>Progress</div>
                  <div>Budget Status</div>
                  <div>Deadline</div>
                  <div>Actions</div>
                </div>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{project.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Client: {project.client}
                      </div>
                    </div>
                    <div>{project.team}</div>
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
                              width: `${project.progress}%`,
                              height: '100%',
                              background: getStatusColor(project.status),
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.875rem' }}>
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div>
                          {project.spent} / {project.budget}
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          {Math.round(
                            (parseInt(project.spent.replace(/[₹,]/g, '')) /
                              parseInt(project.budget.replace(/[₹,]/g, ''))) *
                              100
                          )}
                          % used
                        </div>
                      </div>
                    </div>
                    <div>{project.deadline}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className='action-button primary'>View</button>
                      <button className='action-button'>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>Financial Reports</h2>

              <div className='stats-grid'>
                <div className='stat-card'>
                  <div className='stat-number'>₹25,45,000</div>
                  <div className='stat-label'>Monthly Revenue</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>₹18,20,000</div>
                  <div className='stat-label'>Monthly Expenses</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>₹7,25,000</div>
                  <div className='stat-label'>Net Profit</div>
                </div>
                <div className='stat-card'>
                  <div className='stat-number'>28.5%</div>
                  <div className='stat-label'>Profit Margin</div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                }}>
                <div className='portal-card'>
                  <h3 className='portal-card-title'>Revenue vs Target</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    {revenueData.map((data, index) => (
                      <div key={index}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                          }}>
                          <span style={{ fontWeight: '500' }}>
                            {data.month} 2024
                          </span>
                          <span
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            ₹{(data.actual / 100000).toFixed(1)}L / ₹
                            {(data.target / 100000).toFixed(1)}L
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '8px',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}>
                          <div
                            style={{
                              width: `${Math.min(
                                (data.actual / data.target) * 100,
                                100
                              )}%`,
                              height: '100%',
                              background:
                                data.actual >= data.target
                                  ? '#22c55e'
                                  : data.actual >= data.target * 0.8
                                  ? '#3b82f6'
                                  : '#f59e0b',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='portal-card'>
                  <h3 className='portal-card-title'>Project Budgets</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    {projects.map((project) => (
                      <div key={project.id}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                          }}>
                          <span
                            style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                            {project.name}
                          </span>
                          <span
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {project.spent} / {project.budget}
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
                              width: `${Math.min(
                                (parseInt(project.spent.replace(/[₹,]/g, '')) /
                                  parseInt(
                                    project.budget.replace(/[₹,]/g, '')
                                  )) *
                                  100,
                                100
                              )}%`,
                              height: '100%',
                              background: '#3b82f6',
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

          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ marginBottom: '2rem' }}>Analytics & Insights</h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                }}>
                <div className='portal-card'>
                  <h3 className='portal-card-title'>Team Productivity</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{team.name}</div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {team.projects} active projects
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '600', color: '#22c55e' }}>
                            {team.efficiency}%
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
                  <h3 className='portal-card-title'>Project Health</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <span>On Track</span>
                      <span style={{ fontWeight: '600', color: '#22c55e' }}>
                        6 projects
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <span>At Risk</span>
                      <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                        2 projects
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <span>Delayed</span>
                      <span style={{ fontWeight: '600', color: '#ef4444' }}>
                        0 projects
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      <span>Completed</span>
                      <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                        4 projects
                      </span>
                    </div>
                  </div>
                </div>

                <div className='portal-card'>
                  <h3 className='portal-card-title'>Resource Utilization</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                        }}>
                        <span>Development Team</span>
                        <span>85%</span>
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
                            width: '85%',
                            height: '100%',
                            background: '#3b82f6',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                        }}>
                        <span>Design Team</span>
                        <span>92%</span>
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
                            width: '92%',
                            height: '100%',
                            background: '#22c55e',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                        }}>
                        <span>QA Team</span>
                        <span>78%</span>
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
                            width: '78%',
                            height: '100%',
                            background: '#f59e0b',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
