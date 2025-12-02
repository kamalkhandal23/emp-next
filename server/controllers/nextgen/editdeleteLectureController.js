import NG_Courses from "../../models/education/NG_Courses.js";

// PUT /lectures/:id
export const updateLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    console.log("going in update",lectureId)
    const { title, description, videoURL,pdfURL } = req.body;
    console.log(req.body)
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
    lecture.pdfURL = pdfURL

    await course.save({ validateModifiedOnly: true });


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


export const deleteLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;

    // This command finds the course containing the lecture
    // AND removes the lecture in one go.
    // It bypasses the Schema validation check on existing data.
    const course = await NG_Courses.findOneAndUpdate(
      { "lectures._id": lectureId },
      { $pull: { lectures: { _id: lectureId } } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

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