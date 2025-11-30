import Router from "express"
import { addLectureToCourse } from "../../controllers/nextgen/addLectureController.js"
const router = Router()

//http://localhost:5002/api/nextgen/lectures/
router.put("/:lectureId")
router.delete("/:lectureId")


export default router