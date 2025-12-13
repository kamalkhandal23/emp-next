import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';

export default function ManageClassLinks() {
  const [classLinks, setClassLinks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coursesError, setCoursesError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [editingClassLink, setEditingClassLink] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    date: '',
    time: '',
    videoURL: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchClassLinks(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.getMyCourses();
      if (response.success && response.data) {
        setCourses(response.data.courses || []);
      } else {
        setCoursesError('Failed to load courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCoursesError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassLinks = async (courseId) => {
    try {
      setLoading(true);
      const response = await apiClient.getclassLinks(courseId);
      if (response.success && response.data) {
        setClassLinks(response.data.classLinks || []);
      } else {
        setClassLinks([]);
      }
    } catch (err) {
      console.error('Error fetching class links:', err);
      setError(err.message);
      setClassLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClassLink = (classLink) => {
    setEditingClassLink(classLink);
    setEditForm({
      title: classLink.title || '',
      date: classLink.date || '',
      time: classLink.time || '',
      videoURL: classLink.videoURL || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateClassLink = async () => {
    try {
      setLoading(true);
      const response = await apiClient.updateClassLink(editingClassLink._id, editForm);
      if (response.success) {
        alert('Class link updated successfully!');
        setShowEditModal(false);
        setEditingClassLink(null);
        fetchClassLinks(selectedCourse);
      } else {
        throw new Error(response.message || 'Failed to update class link');
      }
    } catch (err) {
      console.error('Error updating class link:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassLink = async (classLinkId, title) => {
    if (!confirm(`Are you sure you want to delete the class link "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.deleteClassLink(classLinkId);
      if (response.success) {
        alert('Class link deleted successfully!');
        fetchClassLinks(selectedCourse);
      } else {
        throw new Error(response.message || 'Failed to delete class link');
      }
    } catch (err) {
      console.error('Error deleting class link:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && classLinks.length === 0 && !selectedCourse) {
    return (
      <div className='portal-layout'>
        <div className='portal-header'>
          <div className='container'>
            <h1>Manage Class Links</h1>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='portal-layout'>
      <div className='portal-header'>
        <div className='container'>
          <h1>Manage Class Links</h1>
          <p>View and manage class links for courses</p>
        </div>
      </div>

      <div className='portal-content'>
        <div className='container'>
          {/* Course Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Select Course:
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className='form-input'
              style={{ width: '100%', maxWidth: '400px' }}
            >
              <option value=''>Select a course...</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          {selectedCourse && (
            <div className='stats-grid' style={{ marginBottom: '2rem' }}>
              <div className='stat-card'>
                <div className='stat-number'>{classLinks.length}</div>
                <div className='stat-label'>Total Class Links</div>
              </div>
            </div>
          )}

          {/* Class Links Table */}
          {selectedCourse && (
            <div className='data-table'>
              <div className='table-header'>Class Links for Selected Course</div>

              <div
                className='table-row'
                style={{
                  gridTemplateColumns: '2fr 1fr 1fr 2fr auto',
                  fontWeight: 600,
                  background: '#f8fafc',
                }}>
                <div>Title</div>
                <div>Date</div>
                <div>Time</div>
                <div>Video URL</div>
                <div>Actions</div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                  <p>Loading class links...</p>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
                  <p>Error loading class links: {error}</p>
                </div>
              ) : classLinks.length > 0 ? (
                classLinks.map((classLink) => (
                  <div
                    key={classLink._id}
                    className='table-row'
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 2fr auto' }}>
                    <div style={{ fontWeight: 500 }}>
                      {classLink.title}
                    </div>
                    <div>{classLink.date}</div>
                    <div>{classLink.time}</div>
                    <div style={{ fontSize: '0.875rem', wordBreak: 'break-all' }}>
                      {classLink.videoURL ? (
                        <a href={classLink.videoURL} target="_blank" rel="noopener noreferrer">
                          {classLink.videoURL.length > 30 ? `${classLink.videoURL.substring(0, 30)}...` : classLink.videoURL}
                        </a>
                      ) : 'N/A'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className='action-button primary'
                        onClick={() => handleEditClassLink(classLink)}
                        disabled={loading}>
                        Edit
                      </button>
                      <button
                        className='action-button'
                        onClick={() => handleDeleteClassLink(classLink._id, classLink.title)}
                        disabled={loading}
                        style={{ background: '#ef4444', color: 'white' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280',
                  }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                  <p>No class links found for this course.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Add class links using the Add Class Link page.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Refresh Button */}
          {selectedCourse && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                className='btn-primary'
                onClick={() => fetchClassLinks(selectedCourse)}
                disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh Class Links'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Class Link Modal */}
      {showEditModal && editingClassLink && (
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
              maxWidth: 500,
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
              <h3 style={{ margin: 0, color: 'black' }}>
                Edit Class Link: {editingClassLink.title}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingClassLink(null);
                }}
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

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Title:
                </label>
                <input
                  type='text'
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className='form-input'
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Date:
                </label>
                <input
                  type='date'
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className='form-input'
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Time:
                </label>
                <input
                  type='time'
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className='form-input'
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Video URL:
                </label>
                <input
                  type='url'
                  value={editForm.videoURL}
                  onChange={(e) => setEditForm({ ...editForm, videoURL: e.target.value })}
                  className='form-input'
                  style={{ width: '100%' }}
                  placeholder='https://...'
                />
              </div>
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
                  setShowEditModal(false);
                  setEditingClassLink(null);
                }}
                className='btn-secondary'>
                Cancel
              </button>
              <button
                type='button'
                onClick={handleUpdateClassLink}
                className='btn-primary'
                disabled={loading}>
                {loading ? 'Updating...' : 'Update Class Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
