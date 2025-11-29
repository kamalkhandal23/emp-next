import NG_Courses from "../../models/education/NG_Courses.js";

// PUT /lectures/:id
export const updateLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const { title, description, videoURL } = req.body;

    const course = await NG_Courses.findOne({ "lectures._id": lectureId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    const lecture = course.lectures.id(lectureId);

    if (title !== undefined) lecture.title = title;
    if (description !== undefined) lecture.description = description;
    if (videoURL !== undefined) lecture.videoURL = videoURL;

    await course.save();

    return res.json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// DELETE /lectures/:id
export const deleteLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;

    const course = await NG_Courses.findOne({ "lectures._id": lectureId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    course.lectures = course.lectures.filter(
      (lec) => lec._id.toString() !== lectureId
    );

    await course.save();

    return res.json({
      success: true,
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
