import NG_Courses from "../../models/education/NG_Courses.js"




export const addLectureToCourse = async (req, res) => {
  try {
    const { courseId, lectures } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    if (!Array.isArray(lectures) || lectures.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Lectures must be a non-empty array"
      });
    }

    // Validate lectures before pushing
    for (const lec of lectures) {
      if (!lec.title || !lec.description || !lec.videoURL) {
        return res.status(400).json({
          success: false,
          message: "Each lecture must contain title, description & videoURL"
        });
      }
    }

    const course = await NG_Courses.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Add lectures to existing array
    course.lectures.push(...lectures);

    await course.save({ validateModifiedOnly: true });


    return res.status(200).json({
      success: true,
      message: "Lectures added successfully",
      data: course
    });

  } catch (error) {
    console.log("Error in addLectureToCourse:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


