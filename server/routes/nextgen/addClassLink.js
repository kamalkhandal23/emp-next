import Router from "express"
import { addClassLinkToCourse } from "../../controllers/nextgen/addClassLinkController.js"
const router = Router()

//https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api/nextgen/addLecture/add-class-links
router.post("/add-class-links",addClassLinkToCourse)


export default router