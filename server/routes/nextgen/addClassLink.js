import Router from "express"
import { addClassLinkToCourse } from "../../controllers/nextgen/addClassLinkController.js"
const router = Router()

//http://localhost:5002/api/nextgen/addLecture/add-class-links
router.post("/add-class-links",addClassLinkToCourse)


export default router