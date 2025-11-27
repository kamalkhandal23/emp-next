import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient } from '@utils/api.js';

export default function AvailableLectures() {
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [viewType, setViewType] = useState('grid');
  const [openTopic, setOpenTopic] = useState(null);

  const getStudentData = () => {
    const studentInfo = localStorage.getItem('studentInfo');
    return studentInfo ? JSON.parse(studentInfo) : null;
  };

  // ---------- Demo Lectures ----------
  let demoLectures = [
    {
      _id: '1',
      title: 'Intro to JavaScript',
      topic: 'JavaScript Basics',
      duration: '25 min',
      description: 'Understanding variables and execution flow.',
      videoUrl: 'https://youtube.com',
    },
    {
      _id: '2',
      title: 'React Components Basics',
      topic: 'React Fundamentals',
      duration: '32 min',
      description: 'Understanding components, props and hooks.',
      videoUrl: 'https://youtube.com',
    },
    {
      _id: '3',
      title: 'MongoDB Crash Course',
      topic: 'Databases',
      duration: '28 min',
      description: 'Documents, collections and query basics.',
      videoUrl: 'https://youtube.com',
    },
  ];

  // ---------- Fetch Lecture Videos ----------
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const studentData = getStudentData();
        const studentId = studentData?._id || studentData?.id;

        if (!studentId) throw new Error('Student ID not found');

        const data = await apiClient.getNextGenLectureVideos(studentId);

        if (data?.courses?.length > 0) {
          setCourses(data.courses);
        } else {
          setCourses([
            {
              _id: 'demo-course',
              title: 'Demo Course',
              lectures: demoLectures,
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching lectures:', err);
        setCourses([
          {
            _id: 'demo-course',
            title: 'Demo Course',
            lectures: demoLectures,
          },
        ]);
      }
    };

    fetchLectures();
  }, [id]);

  // ---------- Group Lectures by Topic ----------
  const groupByTopic = (lectures = []) => {
    const groups = {};
    lectures.forEach((lec) => {
      if (!groups[lec.topic]) groups[lec.topic] = [];
      groups[lec.topic].push(lec);
    });
    return groups;
  };

  // ---------- Styles ----------
  const styles = {
    page: {
      padding: 32,
      background: '#F5F7FA',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
    },

    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },

    heading: {
      fontSize: 36,
      fontWeight: 800,
      color: '#1A237E',
    },

    toggleContainer: {
      display: 'flex',
      gap: 10,
    },

    toggleBtn: (active) => ({
      padding: '10px 18px',
      borderRadius: 8,
      cursor: 'pointer',
      border: active ? '2px solid #3949AB' : '2px solid #C5CAE9',
      background: active ? '#3949AB' : 'white',
      color: active ? 'white' : '#3F51B5',
      fontWeight: 600,
      transition: '0.3s',
    }),

    topicCard: {
      background: 'white',
      padding: 18,
      borderRadius: 12,
      marginBottom: 14,
      boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      border: '1px solid #E8EAF6',
    },

    topicHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 20,
      fontWeight: 700,
      color: '#1A237E',
    },

    lectureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: 20,
      marginTop: 18,
      padding: 10,
    },

    lectureList: {
      width: '100%',
      marginTop: 18,
      padding: 10,
    },

    lectureCard: {
      padding: 20,
      borderRadius: 12,
      background: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #E0E0E0',
      transition: '0.3s',
    },

    title: {
      fontSize: 18,
      fontWeight: 700,
      color: '#1A237E',
      marginBottom: 6,
    },

    desc: {
      fontSize: 14,
      color: '#555',
      marginBottom: 10,
    },

    duration: {
      color: '#3949AB',
      fontWeight: 600,
    },

    btn: {
      marginTop: 14,
      padding: '10px 0',
      width: '100%',
      borderRadius: 6,
      background: '#3949AB',
      border: 'none',
      color: 'white',
      fontWeight: 700,
      cursor: 'pointer',
      transition: '0.3s',
    },
  };

  // ---------- Render Lecture Cards ----------
  const renderLectureCards = (lectures) => {
    if (viewType === 'grid') {
      return (
        <div style={styles.lectureGrid}>
          {lectures.map((lec) => (
            <div key={lec._id} style={styles.lectureCard}>
              <h3 style={styles.title}>{lec.title}</h3>
              <p style={styles.desc}>{lec.description}</p>
              <p style={styles.duration}>⏱ {lec.duration}</p>

              <button
                style={styles.btn}
                onClick={() => window.open(lec.videoUrl, '_blank')}>
                ▶ Watch Video
              </button>
            </div>
          ))}
        </div>
      );
    }

    // List View
    return (
      <table style={styles.lectureList}>
        <tbody>
          {lectures.map((lec) => (
            <tr
              key={lec._id}
              style={{
                background: 'white',
                borderBottom: '1px solid #EEE',
                padding: '12px 0',
              }}>
              <td style={{ padding: 12, fontWeight: 600 }}>{lec.title}</td>
              <td style={{ padding: 12 }}>{lec.description}</td>
              <td style={{ padding: 12, color: '#3949AB' }}>{lec.duration}</td>
              <td style={{ padding: 12 }}>
                <button
                  style={{ ...styles.btn, padding: '8px 14px' }}
                  onClick={() => window.open(lec.videoUrl, '_blank')}>
                  ▶ Watch
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.headerRow}>
        <h1 style={styles.heading}>Available Lectures</h1>

        <div style={styles.toggleContainer}>
          <div
            style={styles.toggleBtn(viewType === 'grid')}
            onClick={() => setViewType('grid')}>
            Grid
          </div>
          <div
            style={styles.toggleBtn(viewType === 'list')}
            onClick={() => setViewType('list')}>
            List
          </div>
        </div>
      </div>

      {/* COURSES */}
      {courses.map((course) => {
        const topics = groupByTopic(course.lectures);

        return (
          <div key={course._id}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>
              {course.title}
            </h2>

            {Object.keys(topics).map((topic) => (
              <div key={topic}>
                <div
                  style={styles.topicCard}
                  onClick={() =>
                    setOpenTopic(openTopic === topic ? null : topic)
                  }>
                  <div style={styles.topicHeader}>
                    {/* 👉 ADDED VIDEO COUNT HERE */}
                    {topic} ({topics[topic].length})
                    <span>{openTopic === topic ? '▲' : '▼'}</span>
                  </div>
                </div>

                {openTopic === topic && renderLectureCards(topics[topic])}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
