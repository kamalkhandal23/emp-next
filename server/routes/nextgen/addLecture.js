import Router from "express"
import { addLectureToCourse } from "../../controllers/nextgen/addLectureController.js"
const router = Router()

//http://localhost:5002/api/nextgen/addLecture/add-lectures
router.post("/add-lectures",addLectureToCourse)


export default router