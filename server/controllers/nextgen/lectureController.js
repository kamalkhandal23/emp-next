import Course from "../../models/nextgen/education/Course.js";
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
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Map the lectures to include only needed fields
        const lectures = course.lectures.map(lec => ({
            _id: lec._id,
            title: lec.title,
            description: lec.description,
            videoURL: lec.videoURL,
            pdfURL: lec.pdfURL || ""
        }));

        // Send course name and lectures
        return res.status(200).json({
            course: {
                _id: course._id,
                title: course.title,
                lectures
            }
        });

    } catch (error) {
        console.error("Error fetching lecture videos:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
