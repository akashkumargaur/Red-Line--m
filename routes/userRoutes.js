import  express  from "express";
import { register,login,logout ,getProfileInFo,changePassword,
    updateProfile,updateProfilePicture,
    forgetPassword,resetPassword,addToPlaylist,removePlaylist,getAllUserData, updateUserRole,deleteUser,deleteMyProfile} from "../controllers/userController.js";
import {authorizeAdmin, isAuthenticated} from "../middleware/Auth.js"
import singleUpload from "../middleware/multer.js";

const router= express.Router();

//to register a new user
router.route("/register").post(singleUpload,register)

//to login a  user
router.route("/login").post(login)

//to logout
router.route("/logout").get(logout)

//to get profile info
router.route("/me").get(isAuthenticated,getProfileInFo).delete(isAuthenticated,deleteMyProfile)

//to change password
router.route("/changepassword").put(isAuthenticated,changePassword)

//to update profile
router.route("/updateprofile").put(isAuthenticated,updateProfile)

//to update profile picture
router.route("/updateprofilepicture").put(isAuthenticated,singleUpload,updateProfilePicture)

//to forget password
router.route("/forgetpassword").post(forgetPassword)

//to reset password
router.route("/resetpassword/:token").put(resetPassword)

//to add playlist
router.route("/addplaylist").post(isAuthenticated,addToPlaylist)

//to remove playlist
router.route("/removeplaylist").delete(isAuthenticated,removePlaylist)

//Admin route
router.route("/admin/user").get(isAuthenticated,authorizeAdmin,getAllUserData)

router.route("/admin/user/:id").put(isAuthenticated,authorizeAdmin,updateUserRole).delete(isAuthenticated,authorizeAdmin,deleteUser)

export default  router;