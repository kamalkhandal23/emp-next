import Router from "express"
import { updateLecture,deleteLecture } from "../../controllers/nextgen/editdeleteLectureController.js";
import { auth, authorize } from '../../middleware/auth.js';
const router = Router()


// Protected routes (Admin/Course Manager)
router.use(auth);
router.use(authorize(['admin', 'course_manager']));


// @route : /api/nextgen/lectures/:lectureId
// @des : get particular  lecture from Ng_Courses for selected course
// @method : put
router.put("/:id",updateLecture)
// @route : /api/nextgen/lectures/:lectureId
// @des : get particular  lecture from Ng_Courses for selected course
// @method : delete
router.delete("/:id",deleteLecture)


export default router