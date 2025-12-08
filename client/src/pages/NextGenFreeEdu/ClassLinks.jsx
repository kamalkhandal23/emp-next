import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../utils/api";

function ClassLinks() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState("");

  const [classLinks, setClassLinks] = useState([
    { title: "", date: "", time: "", ClassURL: "" }
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
          console.log(res);
          setCourses(res.data.courses);
        }
      } catch (e) {
        console.log("Error fetching courses", e);
        alert("Error in fetching courses: " + e.message);
      }
      setLoadingCourses(false);
    };

    loadCourses();
  }, []);

  const handleClassLinkChange = (index, field, value) => {
    const updated = [...classLinks];
    updated[index][field] = value;
    setClassLinks(updated);
  };

  const handleSelectedCourse = (e) => {
    setSelectedCourse(e.target.value);
    console.log("Selected course:", e.target.value);
  };

  const addNewClassLink = () => {
    setClassLinks([
      ...classLinks,
      { title: "", date: "", time: "", ClassURL: "" }
    ]);
  };

  const removeClassLink = (index) => {
    const updated = classLinks.filter((_, i) => i !== index);
    setClassLinks(updated);
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      alert("Please select a course");
      return;
    }

    const valid = classLinks.every(
      (link) => link.title.trim() !== "" && link.date.trim() !== "" && link.time.trim() !== ""
    );

    if (!valid) {
      alert("❗ Each class link must have a title, date, and time");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        courseId: selectedCourse,
        classLinks: classLinks
      };

      console.log("Payload:", payload);

      const response = await apiClient.addClassLinks(payload);
      console.log("API response:", response);

      if (response.success) {
        alert("🎉 Class links added successfully!");
        navigate("/portal/coursemanager");
      } else {
        alert("❌ Failed: " + (response.message || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Error adding class links: " + e.message);
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

      <h1 className="text-3xl font-bold mb-6 text-gray-950" style={{ color: "black" }}>
        📚 Add Class Links to Course
      </h1>

      {/* Course Select */}
      <label className="font-semibold text-gray-700">Select Course</label>
      <select
        value={selectedCourse}
        onChange={handleSelectedCourse}
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

      {/* Class Links */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: "purple" }}>
          Class Link Details
        </h2>

        {classLinks.map((link, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg mb-4 bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold" style={{ color: "green" }}>
                Class Link {index + 1}
              </h3>
              {index > 0 && (
                <button
                  className="text-red-500"
                  onClick={() => removeClassLink(index)}
                >
                  Remove
                </button>
              )}
            </div>

            <input
              className="w-full mt-3 border px-4 py-2 rounded"
              placeholder="Class Title"
              value={link.title}
              onChange={(e) =>
                handleClassLinkChange(index, "title", e.target.value)
              }
            />

            <input
              className="w-full mt-3 border px-4 py-2 rounded"
              type="date"
              placeholder="Class Date"
              value={link.date}
              onChange={(e) =>
                handleClassLinkChange(index, "date", e.target.value)
              }
            />

            <input
              className="w-full mt-3 border px-4 py-2 rounded"
              type="time"
              placeholder="Class Time"
              value={link.time}
              onChange={(e) =>
                handleClassLinkChange(index, "time", e.target.value)
              }
            />

            <input
              className="w-full mt-3 border px-4 py-2 rounded"
              placeholder="Class Video URL"
              value={link.ClassURL}
              onChange={(e) =>
                handleClassLinkChange(index, "ClassURL", e.target.value)
              }
            />
          </div>
        ))}

        <button
          onClick={addNewClassLink}
          className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold mt-4"
        >
          ➕ Add Another Class Link
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold mt-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Class Links to Course"}
      </button>
    </div>
  );
}

export default ClassLinks;
