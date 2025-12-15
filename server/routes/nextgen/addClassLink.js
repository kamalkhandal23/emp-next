import Router from "express"
import { addClassLinkToCourse } from "../../controllers/nextgen/addClassLinkController.js"
const router = Router()

//https://emp-new-2.onrender.com/api/nextgen/addLecture/add-class-links
router.post("/add-class-links",addClassLinkToCourse)


export default router