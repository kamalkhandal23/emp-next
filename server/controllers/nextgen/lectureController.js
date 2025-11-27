import Course from "../../models/nextgen/education/Course.js";
import ng_student from "../../models/ng_student.js";

export const getLectureVideo = async (req, res) => {
    const { Id }  = req.params;
    // console.log("Fetching lecture videos for student ID:", Id);
    //
    // try {
    //     // Optional: check if student exists in DB if needed
    //     const student = await ng_student.findOne({ student_id: Id });
    //     console.log("Student found:", student);
    //     if (!student) {
    //         return res.status(404).json({ message: "Student not found" });
    //     }
    //     console.log(student);
    //     const  courseId = student.course._id;
    //     console.log(courseId);
    //     const course = await Course.findById(courseId);
    //     console.log(course);
    //
    //     if (!course) {
    //         return res.status(403).json({ message: "Student not enrolled in this course" });
    //     }
    //     const lectures = course.lectures;
    //     console.log("Lectures fetched from DB:", lectures);
    //     return res.status(200).json({ courses: [{ _id: course._id, title: course.title, lectures }] });
    // } catch (error) {
    //     console.error("Error fetching lecture videos:", error);
    //     return res.status(500).json({ message: "Server error" });
    // }
    const lectures = [
        {
            _id: "1",
            title: "Intro to JavaScript",
            duration: "25 min",
            description: "Basics of variables, datatypes and execution flow.",
            color: "#E3F2FD",
            videoUrl: "https://youtube.com",
            topic: "JavaScript Basics",
        },
        {
            _id: "2",
            title: "React Components Basics",
            duration: "32 min",
            description: "Understanding components, props and hooks.",
            color: "#FFF3E0",
            videoUrl: "https://youtube.com",
            topic: "React Fundamentals",
        },
        {
            _id: "3",
            title: "MongoDB Crash Course",
            duration: "28 min",
            description: "Documents, collections and queries.",
            color: "#FCE4EC",
            videoUrl: "https://youtube.com",
            topic: "Database",
        },
        {
            _id: "4",
            title: "React useState Deep Dive",
            duration: "18 min",
            description: "Understanding useState and rerenders.",
            color: "#E8F5E9",
            videoUrl: "https://youtube.com",
            topic: "React Fundamentals",
        }
    ];
    console.log("Lectures fetched:", lectures);
    return res.status(200).json({ courses: [{ _id: "demo-course", title: "Demo course", lectures }] });
};
