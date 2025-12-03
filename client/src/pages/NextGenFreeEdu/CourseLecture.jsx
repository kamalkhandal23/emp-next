import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/api";

function CourseLecture() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // const [selectedCourseId ,setSelectedCourseId] = useState("")
  const [selectedCourse , setSelectedCourse] = useState("")

  const [lectures, setLectures] = useState([
    { title: "", description: "", videoURL: "", pdfURL: "" }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Courses
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
          const token = localStorage.getItem("authToken");

          const response = await fetch("http://localhost:5002/api/nextgen/courses/my-courses", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const res = await response.json();

          if (res.success) {
            console.log(res)
            setCourses(res.data.courses)
            // setCourses(data.data.courses);
          }

            
        }catch (e) {
          console.log("Error fetching courses", e);
          alert("error in fetching courses",e.message)
        }
      setLoadingCourses(false);
    };

    loadCourses();
  }, []);

  const handleLectureChange = (index, field, value) => {
    const updated = [...lectures];
    updated[index][field] = value;
    setLectures(updated);
  };

  const handleSelectedCourse = (e)=>{
    setSelectedCourse(e.target.value)
    console.log("This is why ",e.target.value)
    console.log(selectedCourse)
  }

  const addNewLecture = () => {
    setLectures([
      ...lectures,
      { title: "", description: "", videoURL: "", pdfURL: "" }
    ]);
  };

  const removeLecture = (index) => {
    const updated = lectures.filter((_, i) => i !== index);
    setLectures(updated);
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      alert("Please select a course");
      return;
    }

    const valid = lectures.every(
      (l) => l.title.trim() !== "" && l.description.trim() !== ""
    );

    if (!valid) {
      alert("❗ Each lecture must have a title and description");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        courseId: selectedCourse,
        lectures
      };

      console.log("Payload:", payload);

      const response = await fetch(
        "http://localhost:5002/api/nextgen/addLecture/add-lectures",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include", // keep cookies / JWT if needed
        }
      );

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok && data.success) {
        alert("🎉 Lectures added successfully!");
        navigate("/portal/coursemanager");
      } else {
        alert("❌ Failed: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Error adding lectures");
    }

    setIsSubmitting(false);
  };


  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-xl">

      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-gray-950" style={{color: "black"}}>📚 Add Lectures to Course</h1>

      {/* Course Select */}
      <label className="font-semibold text-gray-700">Select Course</label>
      <select
        value={selectedCourse}
        onChange={(e) => handleSelectedCourse(e)}
        className="w-full border px-4 py-2 mt-2 rounded-lg"
      >
        <option value="">
          {loadingCourses ? "Loading..." : "Choose Course"}
        </option>

        {courses.map((course, i) => (
          <option key={i} value={course._id}>
            {course.title}
            
          </option>
        ))}
      </select>

      {/* Lectures */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4" style={{color: "purple"}}>Lecture Details</h2>

        {lectures.map((lec, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg mb-4 bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold" style={{color: "green"}}>Lecture {index + 1}</h3>
              {index > 0 && (
                <button
                  className="text-red-500"
                  onClick={() => removeLecture(index)}
                >
                  Remove
                </button>
              )}
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
              required
              value={lec.videoURL}
              onChange={(e) =>
                handleLectureChange(index, "videoURL", e.target.value)
              }
            />

            <input
              className="w-full mt-3 border px-4 py-2 rounded"
              placeholder="PDF/Notes URL (optional)"
              value={lec.pdfURL}
              onChange={(e) =>
                handleLectureChange(index, "pdfURL", e.target.value)
              }
            />
          </div>
        ))}

        <button
          onClick={addNewLecture}
          className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold mt-4"
        >
          ➕ Add Another Lecture
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold mt-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Lectures to Course"}
      </button>
    </div>
  );
}

export default CourseLecture;
