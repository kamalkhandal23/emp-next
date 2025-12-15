import Router from "express"
import { addLectureToCourse } from "../../controllers/nextgen/addLectureController.js"
const router = Router()

//https://emp-new-2.onrender.com/api/nextgen/addLecture/add-lectures
console.log("In addLecture.js route");
router.post("/add-lectures",addLectureToCourse)


export default router