import ng_course from "../../models/education/NG_Courses.js";
import ng_student from "../../models/nextgen/core/NG_ApprovedStudents.js";

export const getLectureVideo = async (req, res) => {
    try {
        const { studentId, courseId } = req.query;

        // Find the student
        const student = await ng_student.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Find the course
        const course = await ng_course.findById(courseId).select("title lectures");
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        return res.status(200).json({
            courses: [course]   // 👈 IMPORTANT: frontend expects array
        });

    } catch (error) {
        console.error("Error fetching lecture videos:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
