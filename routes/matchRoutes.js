import  express  from "express";
import { getAllMatch ,createMatch,getMatch, deletematch} from "../controllers/matchController.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/Auth.js";
import singleUpload from "../middleware/multer.js";

const router= express.Router();

//get all match
router.route("/practice").get(getAllMatch)
//create new match only admin
router.route("/creatematch").post(isAuthenticated,authorizeAdmin,singleUpload,createMatch)
//get match  
router.route("/match/:id").get(isAuthenticated,getMatch)
.delete(isAuthenticated,authorizeAdmin,deletematch)
//delete Match
// router.route("/match").delete(isAuthenticated,authorizeAdmin,deleteLecture)
export default  router;