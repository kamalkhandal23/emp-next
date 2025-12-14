import NG_Courses from "../../models/education/NG_Courses.js"

export const addClassLinkToCourse = async (req, res) => {
  try {
    const { courseId, classLinks } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }
    console.log("Received classLinks:", classLinks);

    if (!Array.isArray(classLinks) || classLinks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Class links must be a non-empty array"
      });
    }

    // Validate class links before pushing
    for (const link of classLinks) {
      if (!link.title || !link.date || !link.time) {
        return res.status(400).json({
          success: false,
          message: "Each class link must contain title, date & time"
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

    // Add class links to existing array
    course.classLinks.push(...classLinks);

    await course.save({ validateModifiedOnly: true });

    return res.status(200).json({
      success: true,
      message: "Class links added successfully",
      data: course
    });

  } catch (error) {
    console.log("Error in addClassLinkToCourse:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
