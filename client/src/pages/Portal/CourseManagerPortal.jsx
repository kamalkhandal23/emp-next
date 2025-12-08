import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';

/**
 * Course Manager Portal (stable build)
 * - No unbalanced JSX
 * - No "registration is not defined" outside map
 * - All arrays guarded, all optionals checked
 * - Approve/Reject calls point to /nextgen/admin/registrations/:id/review
 */

export default function CourseManagerPortal() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!authToken || !userRole) {
      navigate('/login', { replace: true });
    }
  }, []);

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data state
  const [studentRegistrations, setStudentRegistrations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseManagerData, setCourseManagerData] = useState(null);
  const [courseIDForAtt, setcourseIDForAtt] = useState(null);


  // Filter state
  const [courseFilter, setCourseFilter] = useState({
    visibility: 'all', // all, published, draft, archived
    status: 'all', // all, coming_soon, open, closed, registration_not_started, registration_closed
    search: '',
  });

  // Misc
  const [loading, setLoading] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [editCourse, setEditCourse] = useState({
    slug: '',
    title: '',
    subtitle: '',
    duration: '',
    description: '',
    prerequisites: '',
    icon: '📘',
    visibility: 'draft',
    rating: 0,
    banner_url: '',
    courseCode: '',
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: '',
  });

  const [newCourse, setNewCourse] = useState({
    slug: '',
    title: '',
    subtitle: '',
    duration: '',
    description: '',
    prerequisites: '',
    icon: '📘',
    visibility: 'draft',
    rating: 0,
    banner_url: '',
    courseCode: '',
    start_date: '',
    end_date: '',
    registration_start: '',
    registration_end: '',
  });

  // Filtered courses based on frontend filters
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Filter by visibility
    if (courseFilter.visibility !== 'all') {
      filtered = filtered.filter(
        (course) => course.visibility === courseFilter.visibility
      );
    }

    // Filter by status
    if (courseFilter.status !== 'all') {
      filtered = filtered.filter(
        (course) => course.courseStatus === courseFilter.status
      );
    }

    // Filter by search term
    if (courseFilter.search.trim()) {
      const searchTerm = courseFilter.search.toLowerCase().trim();
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTerm) ||
          course.subtitle?.toLowerCase().includes(searchTerm) ||
          course.description?.toLowerCase().includes(searchTerm) ||
          course.courseCode?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [courses, courseFilter]);

  // Helper function to get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'coming_soon':
        return {
          className: 'status-badge status-pending',
          text: 'Coming Soon',
        };
      case 'open':
        return { className: 'status-badge status-active', text: 'Open' };
      case 'closed':
        return { className: 'status-badge status-inactive', text: 'Closed' };
      case 'registration_not_started':
        return {
          className: 'status-badge status-pending',
          text: 'Registration Not Started',
        };
      case 'registration_closed':
        return {
          className: 'status-badge status-warning',
          text: 'Registration Closed',
        };
      case 'draft':
        return { className: 'status-badge status-pending', text: 'Draft' };
      default:
        return {
          className: 'status-badge status-pending',
          text: status || 'Unknown',
        };
    }
  };

  // Mock data fallbacks
  const mockRegistrations = useMemo(
    () => [
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
    ],
    []
  );

  useEffect(() => {
    fetchRegistrations();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      fetchCourseManagerData();
    }
  }, [courses]);
  
  // Fetch registrations from API
  const fetchRegistrations = async (status = 'all') => {
    try {
      const response = await apiClient.getRegistrations(status);
      console.log('Fetched registrations:', response);
      if (response.success && response.data) {
        // console.log("registration",response.data.registrations)
        setStudentRegistrations(response.data.registrations || []);
      } else {
        setStudentRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setStudentRegistrations([]);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getNextGenCourses();
      console.log('fetched courses : ', response);

      if (response.success && response.data) {
        setCourses(response.data.courses || []);
      } else {
        setCourses([]);
      }
    } catch (e) {
      console.error('Error fetching courses:', e);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseManagerData = async () => {
    try {
      // Get current user data from API
      const userResponse = await apiClient.getCurrentUser();
      console.log('Fetched user data:', userResponse);

      let user = userResponse.success && userResponse.data ? userResponse.user || userResponse.data : null;

      // If API fails, try to get from localStorage
      if (!user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          user = JSON.parse(storedUser);
        }
      }

      // Default fallback
      if (!user) {
        user = { full_name: 'Course Manager', assignedCourses: [] };
      }

      // If user doesn't have assignedCourses, try to fetch from ng_users using username
      if (!user.assignedCourses && user.username) {
        try {
          const fullUserResponse = await apiClient.getUserByUsername(user.username);
          console.log('Fetched full user data:', fullUserResponse);
          if (fullUserResponse.success && fullUserResponse.data) {
            user = { ...user, ...fullUserResponse.data };
          }
        } catch (e) {
          console.error('Error fetching full user data:', e);
        }
      }

      // Debug logging
      console.log('User', user);
      console.log('User assignedCourses:', user.assignedCourses);
      console.log('Available courses:', courses.map(c => ({ id: c._id, title: c.title })));

      // Filter courses assigned to this course manager
      const assignedCourses = (user.assignedCourses && Array.isArray(user.assignedCourses))
        ? courses
            .filter(course => {
              const isAssigned = user.assignedCourses.includes(course._id);
              console.log(`Checking course ${course.title} (${course._id}): ${isAssigned}`);
              return isAssigned;
            })
            .map(course => course.title)
            .join(', ') || 'No courses assigned'
        : 'No courses assigned';

      console.log('Final assignedCourses:', assignedCourses);

      const courseManagerInfo = {
        ...user,
        assignedCourses: assignedCourses
      };

      setCourseManagerData(courseManagerInfo);
    } catch (error) {
      console.error('Error fetching course manager data:', error);
      // Try localStorage as fallback
      const storedUser = localStorage.getItem('user');
      let user = { full_name: 'Course Manager', assignedCourses: [] };
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }

      const courseManagerInfo = {
        ...user,
        assignedCourses: courses
          .filter(course => user.assignedCourses?.includes(course._id))
          .map(course => course.title)
          .join(', ') || 'No courses assigned'
      };
      setCourseManagerData(courseManagerInfo);
    }
  };

  /* ----------------- Action Handlers ----------------- */

  // Handle registration approval
  const handleApproveRegistration = async (id) => {
    try {
      setLoading(true);

      const response = await apiClient.approveRegistration(id);
      console.log('✅ Response:', response);
      alert(response?.message || 'Registration approved successfully!');
      fetchRegistrations();
    } catch (error) {
      console.error('Full error object:', error);
      alert(error.message || 'Approval failed!');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration rejection
  const handleRejectRegistration = async (registrationId, reason) => {
    setLoading(true);
    try {
      await apiClient.rejectRegistration(registrationId, reason);
      await fetchRegistrations();
      alert('Registration rejected successfully!');
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert(`Error rejecting registration: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (registration) => {
    const name = registration?.full_name || registration?.fullName || 'Unnamed';
    const course =
      registration?.course_id?.title || registration?.course || 'N/A';
    const phone = registration?.phone || 'N/A';
    const address = registration?.address || 'N/A';
    const documents = Array.isArray(registration?.documents)
      ? registration.documents.join(', ')
      : 'N/A';
    const registrationDate = registration?.created_at
      ? new Date(registration.created_at).toLocaleDateString()
      : registration?.registrationDate || 'N/A';

    alert(
      `Registration Details:\n\nName: ${name}\nEmail: ${
        registration?.email || 'N/A'
      }\nPhone: ${phone}\nCourse: ${course}\nAddress: ${address}\nDocuments: ${documents}\nRegistration Date: ${registrationDate}\nStatus: ${
        registration?.status || 'N/A'
      }`
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);

    // Helper function to format date for datetime-local input
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
    };

    setEditCourse({
      slug: course.slug || '',
      title: course.title || '',
      subtitle: course.subtitle || '',
      duration: course.duration || '',
      description: course.description || '',
      prerequisites: course.prerequisites || '',
      icon: course.icon || '🎓',
      rating: course.rating || 0,
      visibility: course.visibility || 'draft',
      banner_url: course.banner_url || '',
      courseCode: course.courseCode || '',
      start_date: formatDateForInput(course.start_date),
      end_date: formatDateForInput(course.end_date),
      registration_start: formatDateForInput(course.registration_start),
      registration_end: formatDateForInput(course.registration_end),
    });
    setShowEditCourse(true);
  };

  const handleAddCourse = async () => {
    setLoading(true);
    try {
      // Generate courseCode if empty
      const courseData = { ...newCourse };
      if (!courseData.courseCode.trim()) {
        // Generate a unique course code based on title or slug
        const baseCode = courseData.title
          .replace(/[^a-zA-Z0-9]/g, '')
          .substring(0, 6)
          .toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        courseData.courseCode = `${baseCode}${timestamp}`;
      }

      await apiClient.createCourse(courseData);
      await fetchCourses();
      setShowAddCourse(false);
      setNewCourse({
        slug: '',
        title: '',
        subtitle: '',
        duration: '',
        description: '',
        prerequisites: '',
        icon: '📘',
        visibility: 'draft',
        banner_url: '',
        courseCode: '',
        start_date: '',
        end_date: '',
        registration_start: '',
        registration_end: '',
      });
      alert('Course added successfully!');
    } catch (error) {
      console.error('Add course failed:', error);
      alert(`Error adding course: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    console.log(action);
    if (action === 'Create exams') {
      navigate('/portal/coursemanager/createexam');
    }
    if (action === 'Create Assignments') {
      navigate('/portal/coursemanager/createassignment');
    }
    if (action === 'Manage Exams') {
      navigate('/portal/coursemanager/manageexams');
    }
    if (action === 'Create Coding exams') {
      navigate('/portal/coursemanager/createcodingexam');
    }
    if (action === 'Manage Coding Exams') {
      navigate('/portal/coursemanager/managecodingexams');
    }
    if (action === 'Manage Assignments') {
      navigate('/portal/coursemanager/manageassignments');
    }
    if (action === 'Grade Assignments') {
      navigate('/portal/coursemanager/gradeassignments');
    }
    if (action === 'Grade Exams') {
      navigate('/portal/coursemanager/gradeexams');
    }
    if (action === 'Add Lectures to Course') {
      navigate('/portal/coursemanager/courselecture');
    }
    if (action === 'Manage Lecture') {
      navigate('/portal/coursemanager/managelecture');
    }
  };

  const handleDeleteCourse = async (course) => {
    try {
      await apiClient.deleteCourse(course._id);
      alert('Course deleted successfully');
      setCourses((prev) => prev.filter((c) => c._id !== course._id));
    } catch (error) {
      console.error(error);
      alert(`Server error while deleting course: ${error.message}`);
    }
  };

  const handleEditCourseSubmit = async () => {
    setLoading(true);
    try {
      // Prepare data for update, converting empty date strings to null
      const updateData = { ...editCourse };
      const dateFields = [
        'start_date',
        'end_date',
        'registration_start',
        'registration_end',
      ];
      dateFields.forEach((field) => {
        if (updateData[field] === '') {
          updateData[field] = null;
        }
      });

      await apiClient.updateCourse(selectedCourse._id, updateData);
      await fetchCourses();
      setShowEditCourse(false);
      setSelectedCourse(null);
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Edit course failed:', error);
      alert(`Error updating course: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      const response = await apiClient.updatePassword({ password: newPassword });
      if (response.success) {
        alert('Password updated successfully!');
      } else {
        alert('Failed to update password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password: ' + error.message);
    }
  };

  /* ---------------- UI Sections ---------------- */

  const safeRender = (val) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'object') {
      // If it's an encrypted object { c, iv, tag }
      if (val.c && val.iv && val.tag) return '[Encrypted Data]';
      try {
        return JSON.stringify(val);
      } catch {
        return '[Invalid Object]';
      }
    }
    return String(val);
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
              Course Manager Dashboard
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>
              Course Manager Panel
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
          {[
            ['dashboard', 'Dashboard'],
            ['employees', 'Student Management'],
            ['projects', 'Course Overview'],
            ['system', 'Assignments and exams'],
            ['student-registrations', 'Student Registrations'],
            ['reports', 'Reports & Analytics'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`portal-nav-link ${
                activeTab === key ? 'active' : ''
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className='portal-content'>
        <div className='container'>
           {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <section>
              <h2 style={{ marginBottom: '2rem', color: 'black' }}>
                Course Manager Dashboard
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '2rem',
                }}>
                <div className='portal-card'>
                  <div
                    className='portal-card-header'
                    style={{ padding: '1rem 1.5rem' }}>
                    <h3 className='portal-card-title' style={{color:''}}>Course Manager Profile</h3>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    {courseManagerData ? (
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                          <strong>Full Name:</strong> {courseManagerData.full_name || courseManagerData.fullName || 'N/A'}
                        </div>
                        <div>
                          <strong>Assigned Course:</strong> {courseManagerData.assignedCourses}
                        </div>
                        <div>
                          <strong>Password:</strong> {courseManagerData.password || courseManagerData.password_hash ? '••••••••' : 'Not set'}
                        </div>
                        <button
                          className='btn-primary'
                          onClick={() => {
                            const newPassword = prompt('Enter new password:');
                            if (newPassword) {
                              handleChangePassword(newPassword);
                            }
                          }}
                          style={{ marginTop: '1rem' }}>
                          Change Password
                        </button>
                      </div>
                    ) : (
                      <div>Loading profile data...</div>
                    )}
                  </div>
                </div>

                
              </div>
            </section>
          )}
         
          {/* STUDENT MANAGEMENT */}
          {activeTab === 'employees' && (
            <section>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2 style={{ marginBottom: '2rem', color: 'black' }}>
                  Student Management
                </h2>
              </div>

              <div className='data-table'>
                <div className='table-header'>All Students</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                    fontWeight: 600,
                    background: '#f8fafc',
                  }}>
                  <div>Name</div>
                  <div>Course</div>
                  <div>Status</div>
                  <div>Join Date</div>
                  <div>Actions</div>
                </div>

                {studentRegistrations.map((s, i) => {
                  // 1. Create a Date object from the API string
                  const date = new Date(s.updated_at); 

                  // 2. Format the date using the Indian locale (en-IN)
                  // This will output the date in DD/MM/YYYY format.
                  const formattedDate = date.toLocaleDateString('en-IN'); 

                  return (
                      <div
                          key={i}
                          className='table-row'
                          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto' }}>
                          <div style={{ fontWeight: 500 }}>{s.full_name}</div>
                          <div>{s.course_id.title}</div>
                          <div>
                              <span className={`status-badge status-${s.status}`}>
                                  {s.status}
                              </span>
                          </div>
                          
                          {/* 3. Use the formatted date here */}
                          <div>{formattedDate}</div> 
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className='action-button'>Edit</button>
                              <button className='action-button'>View</button>
                          </div>
                      </div>
                  );
              })}
              </div>
            </section>
          )}

          {/* COURSE OVERVIEW */}
          {activeTab === 'projects' && (
            <section>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2 style={{ margin: 0, color: 'black' }}>Course Overview</h2>
                <button
                  className='btn-primary'
                  onClick={() => setShowAddCourse(true)}>
                  Add Course
                </button>
              </div>

              <div className='stats-grid'>
                <StatCard value={courses.length} label='Total Courses' />
                <StatCard
                  value={
                    courses.filter((c) => c.visibility === 'published').length
                  }
                  label='Published Courses'
                />
                <StatCard
                  value={courses.filter((c) => c.visibility === 'draft').length}
                  label='Draft Courses'
                />
                <StatCard
                  value={courses.reduce(
                    (t, c) => t + (c.enrolled_count || 0),
                    0
                  )}
                  label='Total Enrollments'
                />
              </div>

              {/* Course Filters */}
              <div
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  marginBottom: '1.5rem',
                }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '1rem',
                    alignItems: 'end',
                  }}>
                  {/* Search */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#374151',
                      }}>
                      Search Courses
                    </label>
                    <input
                      type='text'
                      placeholder='Search by title, subtitle, code, or description...'
                      value={courseFilter.search}
                      onChange={(e) =>
                        setCourseFilter((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  {/* Visibility Filter */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#374151',
                      }}>
                      Visibility
                    </label>
                    <select
                      value={courseFilter.visibility}
                      onChange={(e) =>
                        setCourseFilter((prev) => ({
                          ...prev,
                          visibility: e.target.value,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        background: 'white',
                      }}>
                      <option value='all'>All</option>
                      <option value='published'>Published</option>
                      <option value='draft'>Draft</option>
                      <option value='archived'>Archived</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#374151',
                      }}>
                      Status
                    </label>
                    <select
                      value={courseFilter.status}
                      onChange={(e) =>
                        setCourseFilter((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        background: 'white',
                      }}>
                      <option value='all'>All Statuses</option>
                      <option value='draft'>Draft</option>
                      <option value='coming_soon'>Coming Soon</option>
                      <option value='registration_not_started'>
                        Registration Not Started
                      </option>
                      <option value='open'>Open</option>
                      <option value='registration_closed'>
                        Registration Closed
                      </option>
                      <option value='closed'>Closed</option>
                    </select>
                  </div>
                </div>

                {/* Filter Summary */}
                <div
                  style={{
                    marginTop: '1rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}>
                  <span>
                    Showing {filteredCourses.length} of {courses.length} courses
                  </span>
                  {(courseFilter.search ||
                    courseFilter.visibility !== 'all' ||
                    courseFilter.status !== 'all') && (
                    <button
                      onClick={() =>
                        setCourseFilter({
                          visibility: 'all',
                          status: 'all',
                          search: '',
                        })
                      }
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                      }}>
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className='data-table'>
                <div className='table-header'>All Courses</div>
                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr auto',
                    fontWeight: 600,
                    background: '#f8fafc',
                    color: 'black',
                  }}>
                  <div>Course Title</div>
                  <div>Subtitle</div>
                  <div>Duration</div>
                  <div>Visibility</div>
                  <div>Status</div>
                  <div>Enrollments</div>
                  <div>Rating</div>
                  <div>Actions</div>
                </div>

                {filteredCourses.map((course, idx) => (
                  <div
                    key={course?._id || idx}
                    className='table-row'
                    style={{
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr auto',
                    }}>
                    <div style={{ fontWeight: 500 }}>
                      {course?.icon} {course?.title}
                    </div>
                    <div>{course?.subtitle || ''}</div>
                    <div>{course?.duration || ''}</div>
                    <div>
                      <span
                        className={`status-badge status-${
                          course?.visibility === 'published'
                            ? 'active'
                            : 'pending'
                        }`}>
                        {course?.visibility}
                      </span>
                    </div>
                    <div>
                      {course?.courseStatus && (
                        <span
                          className={
                            getStatusStyle(course.courseStatus).className
                          }>
                          {getStatusStyle(course.courseStatus).text}
                        </span>
                      )}
                    </div>
                    <div>{course?.enrolled_count || 0}</div>
                    <div>{course?.rating || 0} / 5</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className='action-button primary'
                        onClick={() => handleEditCourse(course)}>
                        Edit
                      </button>
                      <button
                        className='action-button'
                        onClick={() => handleDeleteCourse(course)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Assignments and exams */}
          {activeTab === 'system' && (
            <section>
              <h2 style={{ marginBottom: '2rem', color: 'black' }}>
                Assignments and exams
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                }}>
                <Card title='Assignments' style={{ color: 'black' }}>
                  <ActionList
                    actions={[
                      'Create Assignments',
                      'Manage Assignments',
                      'Grade Assignments',
                    ]}
                    onActionClick={handleActionClick}
                  />
                </Card>
                <Card title='Exams'>
                  <ActionList
                    actions={['Create exams', 'Manage Exams', 'Grade Exams']}
                    onActionClick={handleActionClick}
                  />
                </Card>
                <Card title='Coding exams'>
                  <ActionList
                    actions={[
                      'Create Coding exams',
                      'Manage Coding Exams',
                      'Coding exams Results',
                    ]}
                    onActionClick={handleActionClick}
                  />
                </Card>
              </div>
            </section>
          )}

          {/* STUDENT REGISTRATIONS */}
          {activeTab === 'student-registrations' && (
            <section>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem',
                }}>
                <h2 style={{ marginBottom: '2rem', color: 'black' }}>
                  Student Registrations
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <select
                    className='form-input'
                    style={{ width: 'auto' }}
                    onChange={(e) => fetchRegistrations(e.target.value)}>
                    <option value='all'>All Registrations</option>
                    <option value='pending'>Pending</option>
                    <option value='approved'>Approved</option>
                    <option value='rejected'>Rejected</option>
                    <option value='under_review'>Under Review</option>
                    <option value='submitted'>Submitted</option>
                  </select>
                  <button
                    className='btn-primary'
                    onClick={() => {
                      // CSV export
                      const rows = (studentRegistrations || []).map((r) => [
                        r.full_name || r.fullName || '',
                        r.email || '',
                        r.phone || '',
                        r.course_id?.title || r.course || '',
                        r.status || '',
                        r.created_at || r.registrationDate || '',
                      ]);
                      const csv =
                        'Name,Email,Phone,Course,Status,Registration Date\n' +
                        rows
                          .map((cols) => cols.map(escapeCSV).join(','))
                          .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'student_registrations.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>
                    Export Data
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className='stats-grid' style={{ marginBottom: '2rem' }}>
                <StatCard
                  value={
                    (studentRegistrations || []).filter(
                      (r) =>
                        r.status === 'pending' ||
                        r.status === 'submitted' ||
                        r.status === 'under_review'
                    ).length
                  }
                  label='Pending Approvals'
                />
                <StatCard
                  value={
                    (studentRegistrations || []).filter(
                      (r) => r.status === 'approved' || r.status === 'accepted'
                    ).length
                  }
                  label='Approved'
                />
                <StatCard
                  value={
                    (studentRegistrations || []).filter(
                      (r) => r.status === 'rejected'
                    ).length
                  }
                  label='Rejected'
                />
                <StatCard
                  value={(studentRegistrations || []).length}
                  label='Total Registrations'
                />
              </div>

              {/* Table */}
              <div className='data-table'>
                <div className='table-header'>
                  Student Registration Requests
                </div>

                <div
                  className='table-row'
                  style={{
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 2fr',
                    fontWeight: 600,
                    background: '#f8fafc',
                  }}>
                  <div>Student Details</div>
                  <div>Course</div>
                  <div>Registration Date</div>
                  <div>Documents</div>
                  <div>Status</div>
                  <div>Actions</div>
                  <div>Notes</div>
                </div>

                {Array.isArray(studentRegistrations) &&
                studentRegistrations.length > 0 ? (
                  studentRegistrations.map((registration) => {
                    const name =
                      registration?.full_name ||
                      registration?.fullName ||
                      'Unnamed';
                    const email = registration?.email || 'No email';
                    const phone = registration?.phone || 'N/A';
                    const course =
                      registration?.course_id?.title ||
                      registration?.course ||
                      'N/A';
                    const dateVal =
                      registration?.created_at ||
                      registration?.registrationDate;
                    const dateStr = dateVal
                      ? new Date(dateVal).toLocaleDateString()
                      : 'N/A';
                    const docs = Array.isArray(registration?.documents)
                      ? registration.documents
                      : [];
                    const status = registration?.status || 'pending';
                    const notes =
                      registration?.notes ||
                      registration?.rejectionReason ||
                      '';

                    const statusClass =
                      status === 'accepted' || status === 'approved'
                        ? 'active'
                        : status === 'rejected'
                        ? 'inactive'
                        : 'pending';

                    return (
                      <div
                        key={registration?._id || registration?.id}
                        className='table-row'
                        style={{
                          gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 2fr',
                        }}>
                        {/* Student Info */}
                        <div>
                          <div
                            style={{
                              fontWeight: 500,
                              marginBottom: '0.25rem',
                            }}>
                            {safeRender(name)}
                          </div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {safeRender(email)}
                          </div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {safeRender(phone)}
                          </div>
                        </div>

                        {/* Course */}
                        <div>
                          <div style={{ fontWeight: 500 }}>{course}</div>
                          <div
                            style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {registration?.address || 'N/A'}
                          </div>
                        </div>

                        {/* Date */}
                        <div>{dateStr}</div>

                        {/* Docs */}
                        <div>
                          <div style={{ fontSize: '0.875rem' }}>
                            {docs.length > 0 ? `${docs.length} docs` : '0 docs'}
                          </div>
                          {docs.length > 0 && (
                            <button
                              className='action-button'
                              onClick={() =>
                                alert(`Documents:\n${docs.join('\n')}`)
                              }
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                              }}>
                              View
                            </button>
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          <span
                            className={`status-badge status-${statusClass}`}>
                            {status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}>
                          {(status === 'submitted' ||
                            status === 'under_review' ||
                            status === 'pending') && (
                            <>
                              <button
                                className='action-button primary'
                                onClick={() =>
                                  handleApproveRegistration(
                                    registration?._id || registration?.id
                                  )
                                }
                                disabled={loading}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.5rem',
                                }}>
                                {loading ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                className='action-button'
                                onClick={() => {
                                  const reason = prompt(
                                    'Enter rejection reason:'
                                  );
                                  if (reason) {
                                    handleRejectRegistration(
                                      registration?._id || registration?.id,
                                      reason
                                    );
                                  }
                                }}
                                disabled={loading}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.5rem',
                                  background: '#ef4444',
                                  color: 'white',
                                }}>
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            className='action-button'
                            onClick={() => handleViewDetails(registration)}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                            }}>
                            Details
                          </button>
                        </div>

                        {/* Notes / meta */}
                        <div style={{ fontSize: '0.875rem' }}>
                          {(status === 'accepted' || status === 'approved') &&
                            registration?.reviewed_at && (
                              <div style={{ color: '#22c55e' }}>
                                Approved on{' '}
                                {new Date(
                                  registration.reviewed_at
                                ).toLocaleDateString()}
                                {registration?.reviewed_by?.full_name && (
                                  <div style={{ fontSize: '0.75rem' }}>
                                    by {registration.reviewed_by.full_name}
                                  </div>
                                )}
                              </div>
                            )}

                          {status === 'rejected' && (
                            <div style={{ color: '#ef4444' }}>
                              <div>
                                Rejected on{' '}
                                {new Date(
                                  registration?.reviewed_at ||
                                    registration?.rejectedDate ||
                                    new Date()
                                ).toLocaleDateString()}
                              </div>
                              {notes && (
                                <div
                                  style={{
                                    fontSize: '0.75rem',
                                    marginTop: '0.25rem',
                                  }}>
                                  Reason: {safeRender(notes)}
                                </div>
                              )}
                            </div>
                          )}

                          {(status === 'submitted' ||
                            status === 'under_review' ||
                            status === 'pending') && (
                            <div style={{ color: '#f59e0b' }}>
                              Awaiting review
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p
                    style={{
                      textAlign: 'center',
                      color: '#6b7280',
                      marginTop: '1rem',
                    }}>
                    No registrations found.
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div style={{ marginTop: '2rem' }}>
                <div className='portal-card'>
                  <div className='portal-card-header'>
                    <h3
                      className='portal-card-title'
                      style={{ color: 'black' }}>
                      Quick Actions
                    </h3>
                  </div>

                  <div
                    style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      className='btn-primary'
                      onClick={() => {
                        const pendingCount = (
                          studentRegistrations || []
                        ).filter(
                          (r) =>
                            r.status === 'pending' ||
                            r.status === 'submitted' ||
                            r.status === 'under_review'
                        ).length;

                        if (!pendingCount) {
                          alert('No pending registrations to approve');
                          return;
                        }
                        if (
                          confirm(
                            `Approve all ${pendingCount} pending registrations (UI only)?`
                          )
                        ) {
                          // Local UI update only (no bulk API)
                          setStudentRegistrations((prev) =>
                            (prev || []).map((r) =>
                              r.status === 'pending' ||
                              r.status === 'submitted' ||
                              r.status === 'under_review'
                                ? {
                                    ...r,
                                    status: 'approved',
                                    approvedDate: new Date()
                                      .toISOString()
                                      .split('T')[0],
                                  }
                                : r
                            )
                          );
                          alert(
                            'All pending registrations marked approved (UI).'
                          );
                        }
                      }}>
                      Approve All Pending
                    </button>

                    <button
                      className='btn-secondary'
                      onClick={() => {
                        const rows = (studentRegistrations || []).map((r) => [
                          r.full_name || r.fullName || '',
                          r.email || '',
                          r.phone || '',
                          r.course_id?.title || r.course || '',
                          r.status || '',
                          r.created_at || r.registrationDate || '',
                        ]);
                        const csv =
                          'Name,Email,Phone,Course,Status,Registration Date\n' +
                          rows
                            .map((cols) => cols.map(escapeCSV).join(','))
                            .join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'student_registrations.csv';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}>
                      Download CSV
                    </button>

                    <button
                      className='btn-secondary'
                      onClick={() => {
                        fetchRegistrations();
                        alert('Registration data refreshed!');
                      }}>
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <section>
              <h2 style={{ marginBottom: '2rem', color: 'black' }}>
                Reports & Analytics
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                }}>
                <Card title='Course Management'>
                  <ActionList
                    actions={[
                      'Add Lectures to Course',
                      'Manage Lecture'
                    ]}
                    onActionClick={handleActionClick}
                  />
                </Card>
                <Card title='Online Classes'>
                  <ActionList
                    actions={[
                      'Add Class Link',
                      'Manage Class Links'
                    ]}
                  />
                </Card>
                <Card title='Attendances'>
                  <ActionList
                    actions={[
                      'Student Attendance',
                    ]}
                    onActionClick={(action) => {
                      if (action === 'Student Attendance') {
                        navigate('/portal/coursemanager/attendance');
                      }
                    }}
                  />
                </Card>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Add Course Modal (logged-in view) */}
      {showAddCourse && (
        <Modal title='Add New Course' onClose={() => setShowAddCourse(false)}>
          {/* same form as login view; reuse handler */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCourse();
            }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <TextField
                label='Slug'
                value={newCourse.slug}
                onChange={(v) => setNewCourse((p) => ({ ...p, slug: v }))}
                required
                placeholder='course-slug'
              />
              <TextField
                label='Title'
                value={newCourse.title}
                onChange={(v) => setNewCourse((p) => ({ ...p, title: v }))}
                required
                placeholder='Course Title'
              />
              <TextField
                label='Subtitle'
                value={newCourse.subtitle}
                onChange={(v) => setNewCourse((p) => ({ ...p, subtitle: v }))}
                placeholder='Course Subtitle'
              />
              <TextField
                label='Duration'
                value={newCourse.duration}
                onChange={(v) => setNewCourse((p) => ({ ...p, duration: v }))}
                placeholder='e.g., 3 months'
              />
              <TextArea
                label='Description'
                value={newCourse.description}
                onChange={(v) =>
                  setNewCourse((p) => ({ ...p, description: v }))
                }
                rows={3}
              />
              <TextField
                label='Prerequisites'
                value={newCourse.prerequisites}
                onChange={(v) =>
                  setNewCourse((p) => ({ ...p, prerequisites: v }))
                }
              />
              <TextField
                label='Icon'
                value={newCourse.icon}
                onChange={(v) => setNewCourse((p) => ({ ...p, icon: v }))}
                placeholder='🎓'
              />
              <TextField
                label='Rating'
                value={newCourse.rating}
                onChange={(v) =>
                  setNewCourse((p) => ({ ...p, rating: parseFloat(v) || 0 }))
                }
                type='number'
                min='0'
                max='5'
                step='0.1'
                placeholder='0.0'
              />
              <TextField
                label='Banner URL'
                value={newCourse.banner_url}
                onChange={(v) => setNewCourse((p) => ({ ...p, banner_url: v }))}
                placeholder='https://example.com/banner.jpg'
              />
              <Select
                label='Visibility'
                value={newCourse.visibility}
                onChange={(v) => setNewCourse((p) => ({ ...p, visibility: v }))}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                ]}
              />
              <TextField
                label='Course Start Date'
                type='datetime-local'
                value={newCourse.start_date}
                onChange={(v) => setNewCourse((p) => ({ ...p, start_date: v }))}
              />
              <TextField
                label='Course End Date'
                type='datetime-local'
                value={newCourse.end_date}
                onChange={(v) => setNewCourse((p) => ({ ...p, end_date: v }))}
              />
              <TextField
                label='Registration Start Date'
                type='datetime-local'
                value={newCourse.registration_start}
                onChange={(v) =>
                  setNewCourse((p) => ({ ...p, registration_start: v }))
                }
              />
              <TextField
                label='Registration End Date'
                type='datetime-local'
                value={newCourse.registration_end}
                onChange={(v) =>
                  setNewCourse((p) => ({ ...p, registration_end: v }))
                }
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                marginTop: '2rem',
              }}>
              <button
                type='button'
                onClick={() => setShowAddCourse(false)}
                className='btn-secondary'>
                Cancel
              </button>
              <button type='submit' className='btn-primary' disabled={loading}>
                {loading ? 'Adding...' : 'Add Course'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Course Modal (logged-in view) */}
      {showEditCourse && selectedCourse && (
        <Modal
          title='Edit Course'
          onClose={() => {
            setShowEditCourse(false);
            setSelectedCourse(null);
          }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditCourseSubmit();
            }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <TextField
                label='Slug'
                value={editCourse.slug}
                onChange={(v) => setEditCourse((p) => ({ ...p, slug: v }))}
                required
                placeholder='course-slug'
              />
              <TextField
                label='Title'
                value={editCourse.title}
                onChange={(v) => setEditCourse((p) => ({ ...p, title: v }))}
                required
                placeholder='Course Title'
              />
              <TextField
                label='Subtitle'
                value={editCourse.subtitle}
                onChange={(v) => setEditCourse((p) => ({ ...p, subtitle: v }))}
                placeholder='Course Subtitle'
              />
              <TextField
                label='Duration'
                value={editCourse.duration}
                onChange={(v) => setEditCourse((p) => ({ ...p, duration: v }))}
                placeholder='e.g., 3 months'
              />
              <TextArea
                label='Description'
                value={editCourse.description}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, description: v }))
                }
                rows={3}
              />
              <TextField
                label='Prerequisites'
                value={editCourse.prerequisites}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, prerequisites: v }))
                }
              />
              <TextField
                label='Icon'
                value={editCourse.icon}
                onChange={(v) => setEditCourse((p) => ({ ...p, icon: v }))}
                placeholder='🎓'
              />
              <TextField
                label='Rating'
                value={editCourse.rating}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, rating: parseFloat(v) || 0 }))
                }
                type='number'
                min='0'
                max='5'
                step='0.1'
                placeholder='0.0'
              />
              <TextField
                label='Course Code'
                value={editCourse.courseCode}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, courseCode: v }))
                }
                placeholder='e.g., CS101'
              />
              <TextField
                label='Banner URL'
                value={editCourse.banner_url}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, banner_url: v }))
                }
                placeholder='https://example.com/banner.jpg'
              />
              <Select
                label='Visibility'
                value={editCourse.visibility}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, visibility: v }))
                }
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                ]}
              />
              <TextField
                label='Course Start Date'
                type='datetime-local'
                value={editCourse.start_date}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, start_date: v }))
                }
              />
              <TextField
                label='Course End Date'
                type='datetime-local'
                value={editCourse.end_date}
                onChange={(v) => setEditCourse((p) => ({ ...p, end_date: v }))}
              />
              <TextField
                label='Registration Start Date'
                type='datetime-local'
                value={editCourse.registration_start}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, registration_start: v }))
                }
              />
              <TextField
                label='Registration End Date'
                type='datetime-local'
                value={editCourse.registration_end}
                onChange={(v) =>
                  setEditCourse((p) => ({ ...p, registration_end: v }))
                }
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                marginTop: '2rem',
              }}>
              <button
                type='button'
                onClick={() => {
                  setShowEditCourse(false);
                  setSelectedCourse(null);
                }}
                className='btn-secondary'>
                Cancel
              </button>
              <button type='submit' className='btn-primary' disabled={loading}>
                {loading ? 'Updating...' : 'Update Course'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Course Details Modal (logged-in view) */}
      {showCourseDetails && selectedCourse && (
        <Modal
          title={`${selectedCourse?.icon || ''} ${selectedCourse?.title || ''}`}
          onClose={() => {
            setShowCourseDetails(false);
            setSelectedCourse(null);
          }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <KV label='Subtitle' value={selectedCourse?.subtitle || 'N/A'} />
            <KV label='Duration' value={selectedCourse?.duration || 'N/A'} />
            <KV
              label='Description'
              value={selectedCourse?.description || 'N/A'}
            />
            <KV
              label='Prerequisites'
              value={selectedCourse?.prerequisites || 'N/A'}
            />

            {/* Visibility row manually handled (not inside KV) */}
            <div>
              <strong>Visibility:</strong>{' '}
              <span
                className={`status-badge status-${
                  selectedCourse?.visibility === 'published'
                    ? 'active'
                    : 'pending'
                }`}>
                {selectedCourse?.visibility || 'N/A'}
              </span>
            </div>

            <KV
              label='Enrollments'
              value={selectedCourse?.enrolled_count || 0}
            />
            <KV label='Slug' value={selectedCourse?.slug || 'N/A'} />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '2rem',
            }}>
            <button
              className='btn-secondary'
              onClick={() => {
                setShowCourseDetails(false);
                setSelectedCourse(null);
              }}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Small UI helpers ---------------- */

function StatCard({ value, label }) {
  return (
    <div className='stat-card'>
      <div className='stat-number'>{value}</div>
      <div className='stat-label'>{label}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className='portal-card'>
      <h3
        className='portal-card-title'
        style={{
          textAlign: 'center',
          paddingBottom: '1rem',
          color: 'black',
        }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ActionList({ actions = [], onActionClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {actions.map((a, i) => (
        <button
          key={i}
          className={`action-button ${i === 0 ? 'primary' : ''}`}
          onClick={() => onActionClick && onActionClick(a)} // 🔥 call handler
        >
          {a}
        </button>
      ))}
    </div>
  );
}

function KVRow({ label, value, success = false }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
      }}>
      <span>{label}</span>
      <span style={{ color: success ? '#22c55e' : '#111827', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div>
      <strong>{label}:</strong> {safeRender(value)}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
      <div
        style={{
          background: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          width: '90%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
          <h3 style={{ margin: 0, color: 'black' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
            }}
            aria-label='Close'>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}) {
  return (
    <div className='form-group'>
      <label className='form-label'>{label}</label>
      <input
        className='form-input'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <div className='form-group'>
      <label className='form-label'>{label}</label>
      <textarea
        className='form-input'
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div className='form-group'>
      <label className='form-label'>{label}</label>
      <select
        className='form-input'
        value={value}
        onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function escapeCSV(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
