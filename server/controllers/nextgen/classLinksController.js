import NG_Courses from "../../models/education/NG_Courses.js";

export const getClassLinks = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const course = await NG_Courses.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class links retrieved successfully",
      data: {
        classLinks: course.classLinks || []
      }
    });

  } catch (error) {
    console.log("Error in getClassLinks:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const updateClassLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, videoURL } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Class link ID is required"
      });
    }

    if (!title || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Title, date, and time are required"
      });
    }

    // Find the course that contains this class link
    const course = await NG_Courses.findOne({ "classLinks._id": id });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Class link not found"
      });
    }

    // Update the specific class link
    const classLinkIndex = course.classLinks.findIndex(link => link._id.toString() === id);
    if (classLinkIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Class link not found"
      });
    }

    course.classLinks[classLinkIndex] = {
      ...course.classLinks[classLinkIndex],
      title,
      date,
      time,
      videoURL: videoURL || course.classLinks[classLinkIndex].videoURL
    };

    await course.save({ validateModifiedOnly: true });

    return res.status(200).json({
      success: true,
      message: "Class link updated successfully",
      data: course.classLinks[classLinkIndex]
    });

  } catch (error) {
    console.log("Error in updateClassLink:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const deleteClassLink = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Class link ID is required"
      });
    }

    // Find the course that contains this class link
    const course = await NG_Courses.findOne({ "classLinks._id": id });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Class link not found"
      });
    }

    // Remove the class link from the array
    course.classLinks = course.classLinks.filter(link => link._id.toString() !== id);

    await course.save({ validateModifiedOnly: true });

    return res.status(200).json({
      success: true,
      message: "Class link deleted successfully"
    });

  } catch (error) {
    console.log("Error in deleteClassLink:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
