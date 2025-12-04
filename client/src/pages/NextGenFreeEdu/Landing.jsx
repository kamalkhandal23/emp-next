import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';
import CourseCard from '../../components/CourseCard';
import profilePic1 from '../../assets/profilePic1.jpeg';
import profilePic2 from '../../assets/profilePic2.jpeg';
import profilePic3 from '../../assets/profilePic3.jpeg';
import NotificationModal from '../../components/NotificationModal';

export default function NextGenLanding() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const features = [
    {
      title: 'Interactive Learning Platform',
      description:
        'Engage with hands-on projects and real-world scenarios that prepare you for industry challenges.',
      icon: '💻',
      benefits: [
        'Live coding sessions',
        'Project-based learning',
        'Industry mentorship',
        'Peer collaboration',
      ],
    },
    {
      title: 'Smart Assessment System',
      description:
        'Transparent evaluation with instant feedback and detailed performance analytics.',
      icon: '📊',
      benefits: [
        'Real-time scoring',
        'Detailed feedback',
        'Progress tracking',
        'Skill gap analysis',
      ],
    },
    {
      title: 'AICTE Integration',
      description:
        'Officially recognized programs with AICTE support for enhanced credibility.',
      icon: '🎓',
      benefits: [
        'Official certification',
        'Industry recognition',
        'Academic credits',
        'Career support',
      ],
    },
    {
      title: 'Flexible Learning',
      description:
        'Learn at your own pace with 24/7 access to course materials and resources.',
      icon: '⏰',
      benefits: [
        'Self-paced learning',
        '24/7 access',
        'Mobile compatibility',
        'Offline resources',
      ],
    },
  ];

  const stats = [
    { number: '1000+', label: 'Active Students', icon: '👨‍🎓' },
    { number: '50+', label: 'Industry Projects', icon: '💼' },
    { number: '95%', label: 'Completion Rate', icon: '✅' },
    { number: '4.8/5', label: 'Student Rating', icon: '⭐' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      course: 'Full Stack Development',
      content:
        'NextGenFreeEdu transformed my career. The practical approach and industry projects gave me real-world experience.',
      rating: 5,
      image: profilePic1,
    },
    {
      name: 'Rahul Kumar',
      course: 'Cybersecurity',
      content:
        'The hands-on labs and expert mentorship helped me land my dream job in cybersecurity.',
      rating: 5,
      image: profilePic2,
    },
    {
      name: 'Anita Patel',
      course: 'Digital Marketing',
      content:
        'Excellent course structure with real client projects. I started my own digital agency after completion.',
      rating: 5,
      image: profilePic3,
    },
  ];

  function getTimeLeft(targetDate) {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      return null; // time's up
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  const [registrationCount, setRegistrationCount] = useState(12345);

  const enrollmentCloseDate = new Date(2025, 9, 30, 23, 59, 59);

  const [timeLeft, setTimeLeft] = useState(
    getTimeLeft(enrollmentCloseDate.getTime())
  );

  // Helper function to get course registration status
  const getCourseRegistrationStatus = (course) => {
    const currentDate = new Date();

    if (course.registration_start) {
      const regStartDate = new Date(course.registration_start);
      if (currentDate < regStartDate) {
        return {
          status: 'not_started',
          text: 'Registration Opens Soon',
          color: '#fbbf24',
          bgColor: '#fef3c7',
        };
      }
    }

    if (course.registration_end) {
      const regEndDate = new Date(course.registration_end);
      const timeDiff = regEndDate.getTime() - currentDate.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysLeft <= 7 && daysLeft > 0) {
        return {
          status: 'ending_soon',
          text: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`,
          color: '#ef4444',
          bgColor: '#fee2e2',
        };
      } else if (daysLeft > 0) {
        return {
          status: 'active',
          text: 'Registration Open',
          color: '#22c55e',
          bgColor: '#dcfce7',
        };
      }
    }

    return {
      status: 'active',
      text: 'Registration Open',
      color: '#22c55e',
      bgColor: '#dcfce7',
    };
  };

  useEffect(() => {
    // Fetch courses on component mount
    const fetchCourses = async () => {
      try {
        const response = await apiClient.getNextGenCourses();
        const fetchedCourses = response.data.courses || [];

        // Filter courses to only show those with active registration
        const currentDate = new Date();
        const availableCourses = fetchedCourses.filter((course) => {
          // Only show published courses
          if (course.visibility !== 'published') {
            return false;
          }

          // If course has registration_end date, check if registration is still open
          if (course.registration_end) {
            const registrationEndDate = new Date(course.registration_end);
            if (currentDate > registrationEndDate) {
              return false; // Registration has ended, don't show this course
            }
          }

          // If course has end_date, check if course hasn't ended
          if (course.end_date) {
            const courseEndDate = new Date(course.end_date);
            if (currentDate > courseEndDate) {
              return false; // Course has ended, don't show this course
            }
          }

          return true; // Course is available for registration
        });

        // Map available courses to include default values for missing fields
        const coursesWithDefaults = availableCourses.map((course) => ({
          ...course,
          level: 'Beginner to Advanced',
          students: '100+',
          skills: ['Web Development', 'Programming'],
          price: 'Free',
        }));

        setCourses(coursesWithDefaults);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    // Update countdown every second
    const timer = setInterval(() => {
      const updatedTimeLeft = getTimeLeft(enrollmentCloseDate.getTime());

      if (updatedTimeLeft) {
        setTimeLeft(updatedTimeLeft);
      } else {
        setTimeLeft(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const countdownDisplay = timeLeft
    ? `${timeLeft.days} Days ${timeLeft.hours} Hours ${timeLeft.minutes} Minutes ${timeLeft.seconds} Seconds`
    : 'Enrollment Closed';

  return (
    <div
      className='container'
      style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section className='hero-section'>
        <h1 className='hero-title'>NextGenFreedu</h1>
        <p className='hero-subtitle'>
          Revolutionizing education through practical, accessible learning
          experiences. Master in-demand skills with hands-on projects,
          transparent evaluation, and industry mentorship.
        </p>
        <div className='hero-buttons'>
          <Link to='/nextgen/enroll' className='btn-primary'>
            Enroll Now
          </Link>
          <Link to='/nextgen/login' className='btn-outline'>
            Student Login →
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            marginTop: '3rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
          }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#d97706',
                }}>
                {stat.number}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500',
                }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose NextGenFreeEdu */}
      <section className='section'>
        <h2 className='section-title'>Why Choose NextGenFreedu?</h2>
        <p className='section-content' style={{ marginBottom: '2rem' }}>
          Experience a new way of learning that bridges the gap between academic
          knowledge and industry requirements.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
          }}>
          <div>
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => setActiveFeature(index)}
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border:
                    activeFeature === index
                      ? '2px solid #f59e0b'
                      : '2px solid transparent',
                  background:
                    activeFeature === index
                      ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                      : 'white',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow:
                    activeFeature === index
                      ? '0 8px 25px -5px rgba(245, 158, 11, 0.3)'
                      : '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                  <div style={{ fontSize: '2rem' }}>{feature.icon}</div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827',
                      }}>
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        margin: '0.5rem 0 0 0',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                      }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='service-card' style={{ height: 'fit-content' }}>
            <div
              style={{
                fontSize: '3rem',
                textAlign: 'center',
                marginBottom: '1rem',
              }}>
              {features[activeFeature].icon}
            </div>
            <h3 className='service-title'>{features[activeFeature].title}</h3>
            <p
              className='service-description'
              style={{ marginBottom: '1.5rem' }}>
              {features[activeFeature].description}
            </p>
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>
                Key Benefits:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {features[activeFeature].benefits.map((benefit, index) => (
                  <li
                    key={index}
                    style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Registration count */}
      <section
        className='section'
        style={{ textAlign: 'center', margin: '2rem 0' }}>
        <h2 className='section-title'>Registration Count</h2>
        <p style={{ fontSize: '2rem', color: '#d97706', fontWeight: '700' }}>
          {registrationCount.toLocaleString()} Students Registered
        </p>
      </section>

      {/* Available Courses */}
      <section className='section'>
        <h2 className='section-title'>Available Courses</h2>
        <p className='section-content' style={{ marginBottom: '2rem' }}>
          Choose from our comprehensive range of industry-focused courses
          designed by experts.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Loading courses...</p>
          </div>
        ) : error ? (
          <div
            style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <p>{error}</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'stretch',
            }}>
            {courses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
        )}
      </section>

      {/*Closing Timer*/}
      <section
        className='section'
        style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className='section-title'>Enrollment Closes In</h2>
        <div
          id='closing-timer'
          style={{ fontSize: '2rem', color: '#ef4444', fontWeight: '700' }}>
          {countdownDisplay}
        </div>
      </section>

      {/* Student Success Stories */}
      <section className='section'>
        <h2 className='section-title'>Student Success Stories</h2>
        <p className='section-content' style={{ marginBottom: '2rem' }}>
          Hear from our graduates who have transformed their careers through
          NextGenFreedu.
        </p>

        <div
          className='services-grid'
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className='testimonial-card'>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}>
                {typeof testimonial.image === 'string' &&
                (testimonial.image.endsWith('.png') ||
                  testimonial.image.endsWith('.jpeg') ||
                  testimonial.image.endsWith('.jpg') ||
                  testimonial.image.endsWith('.svg')) ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '3rem' }}>{testimonial.image}</div>
                )}

                <div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>
                    {testimonial.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {testimonial.course}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.25rem',
                      marginTop: '0.25rem',
                    }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} style={{ color: '#fbbf24' }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className='testimonial-quote'>
                "{testimonial.content}"
              </blockquote>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className='section'>
        <h2 className='section-title'>How It Works</h2>
        <div className='services-grid'>
          {[
            {
              step: 1,
              title: 'Enroll for Free',
              desc: 'Sign up and choose your course',
              icon: '📝',
            },
            {
              step: 2,
              title: 'Learn & Practice',
              desc: 'Access interactive lessons and projects',
              icon: '💻',
            },
            {
              step: 3,
              title: 'Get Assessed',
              desc: 'Take transparent evaluations',
              icon: '📊',
            },
            {
              step: 4,
              title: 'Earn Certificate',
              desc: 'Receive industry-recognized certification',
              icon: '🏆',
            },
          ].map((step) => (
            <div
              key={step.step}
              className='service-card'
              style={{ textAlign: 'center' }}>
              <div
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: '0 auto 1rem',
                }}>
                {step.step}
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                {step.icon}
              </div>
              <h3 className='service-title'>{step.title}</h3>
              <p className='service-description'>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section
        className='section'
        style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div
          className='hero-section'
          style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
          <h2 className='section-title'>
            Ready to Start Your Learning Journey?
          </h2>
          <p className='section-content' style={{ marginBottom: '2rem' }}>
            Join thousands of students who are already building their future
            with NextGenFreeEdu.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
            <Link to='/nextgen/enroll' className='btn-primary'>
              Enroll Now
            </Link>
            <button
              className='btn-secondary'
              onClick={() => setIsNotificationModalOpen(true)}>
              Notify Me
            </button>

            <Link to='/nextgen/login' className='btn-secondary'>
              Already Enrolled? Login
            </Link>
          </div>
        </div>
      </section>

      {/*Footer*/}
      <footer
        style={{
          textAlign: 'center',
          padding: '2rem 0',
          fontSize: '0.875rem',
          color: '#6b7280',
        }}>
        <Link
          to='privacy-policy'
          className='text-blue-600 hover:underline ml-2'
          style={{ margin: '0 1rem' }}>
          {' '}
          Privacy Policy
        </Link>{' '}
        |
        <Link to='terms-of-service' style={{ margin: '0 1rem' }}>
          Terms of Service
        </Link>{' '}
        |
        <Link to='/contact' style={{ margin: '0 1rem' }}>
          Contact Us
        </Link>
      </footer>

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
}
