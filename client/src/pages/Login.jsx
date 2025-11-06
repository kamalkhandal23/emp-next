import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  /* const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [studentRegistrations, setStudentRegistrations] = useState([]);
  const [loading, setLoading] = useState(false); */

  // Mock data
  /* const adminStats = {
    totalEmployees: 45,
    activeProjects: 12,
    pendingTasks: 28,
    completedTasks: 156,
    totalRevenue: '₹2,45,000',
    monthlyGrowth: '+12%',
  }; */

  /* const recentActivities = [
    {
      id: 1,
      action: 'New employee onboarded',
      user: 'Priya Sharma',
      time: '2 hours ago',
      type: 'success',
    },
    {
      id: 2,
      action: 'Project milestone completed',
      user: 'Team Alpha',
      time: '4 hours ago',
      type: 'info',
    },
    {
      id: 3,
      action: 'System backup completed',
      user: 'System',
      time: '6 hours ago',
      type: 'success',
    },
    {
      id: 4,
      action: 'Security alert resolved',
      user: 'IT Team',
      time: '8 hours ago',
      type: 'warning',
    },
  ]; */

  /* const systemHealth = {
    serverUptime: '99.9%',
    databaseStatus: 'Healthy',
    backupStatus: 'Completed',
    securityStatus: 'Secure',
  }; */

  // Mock student registrations data
  /*  const mockRegistrations = [
    {
      id: 1,
      fullName: 'Arjun Patel',
      email: 'arjun.patel@email.com',
      phone: '+91-9876543210',
      course: 'Full Stack Development',
      registrationDate: '2024-03-01',
      status: 'pending',
      documents: ['10th Certificate', '12th Certificate', 'ID Proof'],
      address: 'Mumbai, Maharashtra',
    },
    {
      id: 2,
      fullName: 'Sneha Sharma',
      email: 'sneha.sharma@email.com',
      phone: '+91-9876543211',
      course: 'Data Science & Analytics',
      registrationDate: '2024-03-02',
      status: 'pending',
      documents: ['Graduation Certificate', 'ID Proof', 'Photo'],
      address: 'Delhi, India',
    },
    {
      id: 3,
      fullName: 'Rohit Kumar',
      email: 'rohit.kumar@email.com',
      phone: '+91-9876543212',
      course: 'Digital Marketing',
      registrationDate: '2024-03-03',
      status: 'approved',
      documents: ['12th Certificate', 'ID Proof'],
      address: 'Bangalore, Karnataka',
    },
    {
      id: 4,
      fullName: 'Priya Singh',
      email: 'priya.singh@email.com',
      phone: '+91-9876543213',
      course: 'UI/UX Design',
      registrationDate: '2024-03-04',
      status: 'rejected',
      documents: ['Graduation Certificate', 'Portfolio'],
      address: 'Pune, Maharashtra',
      rejectionReason: 'Incomplete documentation',
    },
    {
      id: 5,
      fullName: 'Vikash Gupta',
      email: 'vikash.gupta@email.com',
      phone: '+91-9876543214',
      course: 'Cybersecurity',
      registrationDate: '2024-03-05',
      status: 'pending',
      documents: ['Graduation Certificate', 'ID Proof', 'Experience Letter'],
      address: 'Hyderabad, Telangana',
    },
  ]; */

  // Initialize registrations on component mount
  /* useEffect(() => {
    if (isLoggedIn) {
      fetchRegistrations();
    }
  }, [isLoggedIn]); */

  // Fetch registrations from API
  const fetchRegistrations = async (status = 'all') => {
    console.log('Fetching registrations with status:', status);
    /* setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParam = status !== 'all' ? `?status=${status}` : '';

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/nextgen/admin/registrations${queryParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudentRegistrations(data.data.registrations || []);
      } else {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock data');
        setStudentRegistrations(
          status === 'all'
            ? mockRegistrations
            : mockRegistrations.filter((reg) => reg.status === status)
        );
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      // Fallback to mock data
      setStudentRegistrations(
        status === 'all'
          ? mockRegistrations
          : mockRegistrations.filter((reg) => reg.status === status)
      );
    } finally {
      setLoading(false);
    } */
  };

  // Handle registration approval
  /* const handleApproveRegistration = async (registrationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/nextgen/admin/registrations/${registrationId}/review`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'accepted',
            notes: 'Registration approved by admin',
          }),
        }
      );

      if (response.ok) {
        // Refresh the registrations list
        await fetchRegistrations();
        alert('Registration approved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error approving registration: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Error approving registration');
    } finally {
      setLoading(false);
    }
  }; */

  // Handle registration rejection
  /* const handleRejectRegistration = async (registrationId, reason) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/nextgen/admin/registrations/${registrationId}/review`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'rejected',
            notes: reason,
          }),
        }
      );

      if (response.ok) {
        // Refresh the registrations list
        await fetchRegistrations();
        alert('Registration rejected successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error rejecting registration: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Error rejecting registration');
    } finally {
      setLoading(false);
    }
  }; */

  // Handle view registration details
  /* const handleViewDetails = (registration) => {
    const name = registration.full_name || registration.fullName;
    const course = registration.course_id?.title || registration.course;
    const phone = registration.phone || 'N/A';
    const address = registration.address || 'N/A';
    const documents = registration.documents
      ? registration.documents.join(', ')
      : 'N/A';
    const registrationDate = registration.created_at
      ? new Date(registration.created_at).toLocaleDateString()
      : registration.registrationDate;

    alert(
      `Registration Details:\n\nName: ${name}\nEmail: ${registration.email}\nPhone: ${phone}\nCourse: ${course}\nAddress: ${address}\nDocuments: ${documents}\nRegistration Date: ${registrationDate}\nStatus: ${registration.status}`
    );
  }; */

  const handleLogin = (e) => {
    e.preventDefault();
    /* if (loginData.username && loginData.password) {
      setIsLoggedIn(true);
    } */

    console.log('Login attempted');
  };

  return (
    <div className='portal-layout'>
      <div className='portal-header'>
        <div className='container'>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Login Portal</h1>
        </div>
      </div>

      <div className='portal-content'>
        <div className='container' style={{ maxWidth: '400px' }}>
          <div className='portal-card'>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h2>Login</h2>
              {/* <p style={{ color: '#6b7280' }}>
                  Access the administrative dashboard
                </p> */}
            </div>

            <form onSubmit={handleLogin}>
              <div className='form-group'>
                <label className='form-label'>Username</label>
                <input
                  type='text'
                  //value={loginData.username}
                  /* onChange={(e) =>
                    setLoginData({ ...loginData, username: e.target.value })
                  } */
                  className='form-input'
                  placeholder='Enter admin username'
                  required
                />
              </div>

              <div className='form-group'>
                <label className='form-label'>Password</label>
                <input
                  type='password'
                  /*value={loginData.password}
                   onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  } */
                  className='form-input'
                  placeholder='Enter password'
                  required
                />
              </div>

              <button
                type='submit'
                className='btn-primary'
                style={{ width: '100%' }}>
                Login
              </button>
            </form>

            {/* <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f0f9ff',
                borderRadius: '0.5rem',
              }}>
              <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
                Demo: username: admin, password: admin123
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
