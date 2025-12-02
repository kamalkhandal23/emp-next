import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/api";

function ManageLecture() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [lectures, setLectures] = useState([]);

  // -----------------------------
  // 1️⃣ Fetch All Courses
  // -----------------------------
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await apiClient.getNextGenCourses();
        if (response.success){
            setCourses(response.data.courses)
        }
      } catch (e) {
        console.log("Error fetching courses", e);
        alert("error in fetching courses",e.message)
      }
    };

    loadCourses();
  }, []);

  // -----------------------------
  // 2️⃣ Fetch Lectures for Selected Course
  // -----------------------------
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchLectures = async () => {
      try {
        const response = await fetch(
          `http://localhost:5002/api/nextgen/courses/${selectedCourse}`
        );
        const data = await response.json();
        console.log('data',data)

        if (data.success) {
          setLectures(data.data.course.lectures || []);
        }
      } catch (error) {
        console.error("Failed to load lectures:", error);
      }
    };

    fetchLectures();
  }, [selectedCourse]);

  // -----------------------------
  // 3️⃣ Change Local State on Edit
  // -----------------------------
  const handleLectureChange = (index, field, value) => {
    const updated = [...lectures];
    updated[index][field] = value;
    setLectures(updated);
  };

  // -----------------------------
  // 4️⃣ DELETE LECTURE
  // -----------------------------
  const deleteLecture = async (lectureId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(
        `http://localhost:5002/api/nextgen/lectures/${lectureId}`,
        { 
          method: "DELETE",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setLectures((prev) => prev.filter((l) => l._id !== lectureId));
      } else {
        alert("Failed to delete lecture");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // -----------------------------
  // 5️⃣ SAVE EDITED LECTURE
  // -----------------------------
  const updateLecture = async (lecture) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5002/api/nextgen/lectures/${lecture._id}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify(lecture)
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Lecture updated successfully!");
      } else {
        alert("Failed to update lecture");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-xl">

      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-gray-950" style={{color:"black"}}>📘 Manage Course Lectures</h1>

      {/* Select Course */}
      <label className="font-semibold text-gray-700">Select Course</label>
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full border px-4 py-2 mt-2 rounded-lg"
      >
        <option value="">Choose Course</option>
        {courses.map((course, i) => (
          <option key={i} value={course._id}>
            {course.title}
          </option>
        ))}
      </select>

      {/* Lectures */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4" style={{color:"gray"}}>📄 Lecture List</h2>

        {lectures.length === 0 && selectedCourse && (
          <p className="text-gray-500">No lectures found for this course.</p>
        )}

        {lectures.map((lec, index) => (
          <div
            key={lec._id}
            className="border p-4 rounded-lg mb-4 bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold" style={{color:"black"}}>Lecture {index + 1}</h3>

              {/* Delete Button */}
              <button
                className="text-red-500"
                onClick={() => deleteLecture(lec._id)}
              >
                Delete
              </button>
            </div>

            <input
              className="w-full mt-3 border px-4 py-2 rounded"
              placeholder="Lecture Title"
              value={lec.title}
              onChange={(e) =>
                handleLectureChange(index, "title", e.target.value)
              }
            />

            <textarea
              className="w-full mt-3 border px-4 py-2 rounded"
              placeholder="Lecture Description"
              value={lec.description}
              onChange={(e) =>
                handleLectureChange(index, "description", e.target.value)
              }
            />

            <input
              className="w-full mt-3 border px-4 py-2 rounded"
              placeholder="Video URL"
              value={lec.videoURL}
              onChange={(e) =>
                handleLectureChange(index, "videoURL", e.target.value)
              }
            />

            <input
              className="w-full mt-3 border px-4 py-2 rounded"
              placeholder="PDF URL (optional)"
              value={lec.pdfURL}
              onChange={(e) =>
                handleLectureChange(index, "pdfURL", e.target.value)
              }
            />

            {/* Save Changes */}
            <button
              onClick={() => updateLecture(lec)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageLecture;


