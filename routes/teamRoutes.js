import  express  from "express";
import { getAllTeams,shareLink,createTeam ,joinTeam,leaveTeam} from "../controllers/teamController.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/Auth.js";
import singleUpload from "../middleware/multer.js";

const router= express.Router();

//get all teams
router.route("/teams").get(isAuthenticated,authorizeAdmin,getAllTeams)
//create new team 
router.route("/createteam").post(isAuthenticated,singleUpload,createTeam)
//to share join team
router.route("/jointeam/:token").put(isAuthenticated,joinTeam)
//to create join team  link
router.route("/team/sharelink").put(isAuthenticated,shareLink)
//leave Team
router.route("/leaveteam").delete(isAuthenticated,leaveTeam)

export default  router;