import  express  from "express";
import { contact ,courseRequest,getDashboardStatus} from "../controllers/otherController.js";
import {authorizeAdmin, isAuthenticated} from "../middleware/Auth.js"

const router= express.Router();

//contact us
router.route("/contact").post(contact)

//request a course
router.route("/courserequest").post(courseRequest)

//get admin dashboard
router.route("/admin/status").get(isAuthenticated,authorizeAdmin,getDashboardStatus)

export default  router;