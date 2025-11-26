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
      description: 'Basics of variables, datatypes and execution flow.',
      color: '#E3F2FD',
      videoUrl: 'https://youtube.com',
    },
    {
      _id: '2',
      title: 'React Components Basics',
      topic: 'React Fundamentals',
      duration: '32 min',
      description: 'Understanding components, props and hooks.',
      color: '#FFF3E0',
      videoUrl: 'https://youtube.com',
    },
    {
      _id: '3',
      title: 'MongoDB Crash Course',
      topic: 'Databases',
      duration: '28 min',
      description: 'Documents, collections and query intro.',
      color: '#FCE4EC',
      videoUrl: 'https://youtube.com',
    },
  ];

  // ---------- Fetch Lecture Videos ----------
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const studentData = getStudentData();
        const studentId = studentData?._id || studentData?.id;

        if (!studentId) {
          throw new Error('Student ID not found in storage');
        }

        const data = await apiClient.getNextGenLectureVideos(studentId);

        if (data?.courses?.length > 0) {
          setCourses(data.courses);

          demoLectures = data.courses;
          console.log(demoLectures, 'Fetched lecture data:');
          setCourses(demoLectures);
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

  // ---------- Styles ----------
  const styles = {
    page: {
      padding: 30,
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #F6FAFF, #FFFFFF)',
      fontFamily: 'Inter, Arial',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    heading: {
      fontSize: 40,
      fontWeight: 800,
      color: '#0D47A1',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    bookIcon: {
      width: 35,
      height: 35,
      background: '#0D47A1',
      borderRadius: 6,
    },
    toggleContainer: {
      display: 'flex',
      gap: 10,
    },
    toggleBtn: (active) => ({
      padding: '10px 18px',
      borderRadius: 10,
      cursor: 'pointer',
      backgroundColor: active ? '#1976D2' : 'white',
      color: active ? 'white' : '#1976D2',
      border: active ? '2px solid #1565C0' : '2px solid #90CAF9',
      fontWeight: 600,
      transition: '0.25s',
    }),
    courseTitle: {
      fontWeight: 700,
      fontSize: 24,
      color: '#083875',
      marginBottom: 14,
      marginTop: 10,
    },
    lectureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 25,
    },
    lectureList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 25,
    },
    card: {
      padding: 20,
      borderRadius: 18,
      minHeight: 240,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0px 4px 14px rgba(0,0,0,0.15)',
      border: '1px solid #dce3ed',
      transition: '0.3s',
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
      color: '#0D47A1',
      marginBottom: 6,
    },
    desc: {
      color: '#555',
      fontSize: 14,
      marginBottom: 8,
    },
    duration: {
      color: '#1976D2',
      fontWeight: 600,
    },
    btn: {
      padding: '12px 0',
      width: '100%',
      border: 'none',
      borderRadius: 10,
      background: '#1976D2',
      color: 'white',
      fontWeight: 700,
      fontSize: 15,
      cursor: 'pointer',
      transition: '0.25s',
    },
    btnHover: {
      background: '#0D47A1',
      transform: 'scale(1.03)',
    },
  };

  // ---------- Render Lectures ----------
  const renderLectureCards = (lectures) => {
    const container =
      viewType === 'grid' ? styles.lectureGrid : styles.lectureList;
    return (
      <div style={container}>
        {lectures?.map((lec) => (
          <div
            key={lec._id}
            style={{ ...styles.card, backgroundColor: lec.color }}
            className='lectureCard'>
            <div>
              <h3 style={styles.title}>{lec.title}</h3>
              <p style={styles.desc}>{lec.description}</p>
              <p style={styles.duration}>⏱ {lec.duration}</p>
            </div>
            <button
              className='watchBtn'
              style={styles.btn}
              onClick={() => window.open(lec.videoUrl, '_blank')}>
              ▶ Watch Now
            </button>
          </div>
        ))}
      </div>
    );
  };

  // ---------- Hover Effects ----------
  useEffect(() => {
    document.querySelectorAll('.lectureCard').forEach((card) => {
      card.onmouseenter = () => (card.style.transform = 'translateY(-5px)');
      card.onmouseleave = () => (card.style.transform = 'translateY(0)');
    });
    document.querySelectorAll('.watchBtn').forEach((btn) => {
      btn.onmouseenter = () => Object.assign(btn.style, styles.btnHover);
      btn.onmouseleave = () => Object.assign(btn.style, styles.btn);
    });
  }, [courses, viewType]);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.heading}>
          <div style={styles.bookIcon}></div>
          Available Lectures
        </h1>
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
      {courses.map((course) => (
        <div key={course._id || course.id}>
          <h3 style={styles.courseTitle}>{course.title}</h3>
          {renderLectureCards(course.lectures)}
        </div>
      ))}
    </div>
  );
}
