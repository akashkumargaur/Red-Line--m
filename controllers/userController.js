import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsynError } from "../middleware/catchAsyncError.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Match } from "../models/Match.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";

//for register A new user
export const register = catchAsynError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password || !file) {
    return next(new ErrorHandler("please add all field", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User allready Exists", 409));
  }

  // file to cloudnary;
  const fileUrl = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUrl.content);

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  sendToken(res, user, "user register successfully", 201);
});

// for login
export const login = catchAsynError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("please add all field", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Email or Password Exists", 401));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Email or Password Exists", 401));
  }

  sendToken(res, user, `welcome back, ${user.name}`, 200);
});

// for log out
export const logout = catchAsynError(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      // secure:true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logout successfully",
    });
});

//for getting profile info
export const getProfileInFo = catchAsynError(async (req, res, next) => { 
  const user = await User.findById(req.user._id);
  res.status(201).json({
    success: true,
    user,
  });
});

//for change password
export const changePassword = catchAsynError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("please add all field", 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    return next(new ErrorHandler("Please check your old Password ", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(201).json({
    success: true,
    message: "password change successfully",
  });
});

//for profile internal changes
export const updateProfile = catchAsynError(async (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return next(new ErrorHandler("please add all field", 400));
  }

  const user = await User.findById(req.user._id);
  if (name) {
    user.name = name;
  }
  await user.save();

  res.status(201).json({
    success: true,
    message: "profile updated successfully",
  });
});
//for profile picture change 
export const updateProfilePicture = catchAsynError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  // file to cloudnary;
  const file = req.file;

  const fileUrl = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUrl.content);

  await cloudinary.v2.uploader.destroy(user.avatar[0].public_id);

  user.avatar = [
    {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  ];

  await user.save();
  res.status(200).json({
    success: true,
    message: "profile pic change successfully ",
  });
});

//for forget password
export const forgetPassword = catchAsynError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("please enter email", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("no user with this email Exist", 400));
  }

  const resetToken = await user.getResetToken();

  await user.save();
  //frontend url:token
  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `click on the link to reset your password ${url} . if you have not requested then Please ignore`;

  //sent Token to email
  sendEmail(user.email, "reset Password for CourseHub Account", message);

  res.status(200).json({
    success: true,
    message: `reset Token is send to ${user.email}`,
  });
});

//for reset password
export const resetPassword = catchAsynError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new ErrorHandler("Token Expire or invalid", 400));
  }

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "password change successfully  ",
  });
});

//add  playlist to user :todo 1
export const addToPlaylist = catchAsynError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const usercourse = await Match.findById(req.body.id);

  if (!usercourse) {
    return next(new ErrorHandler("invaild course id", 404));
  }

  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === usercourse._id.toString()) return true;
  });

  if (itemExist) {
    return next(new ErrorHandler("Item  Allready Exist", 409));
  }

  user.playlist.push({
    course: usercourse._id,
    poster: usercourse.poster.url,
  });
  await user.save();

  res.status(200).json({
    success: true,
    message: "added to playlist",
  });
});

//remove  playlist to user
export const removePlaylist = catchAsynError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const usercourse = await Course.findById(req.query.id);
  if (!usercourse) {
    return next(new ErrorHandler("invaild course id", 404));
  }

  const newplaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== usercourse._id.toString()) return item;
  });
  user.playlist = newplaylist;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Removed from your account",
  });
});

//Admin routes
export const getAllUserData = catchAsynError(async (req, res, next) => {
  const user = await User.find({});
  res.status(200).json({
    success: true,
    user,
  });
});
//update user role
export const updateUserRole = catchAsynError(async (req, res, next) => {
  const id=req.params.id

  if (!id) {
    return next(new ErrorHandler("not allowed ", 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("Email or Password Exists", 401));
  }

  if (user.role==="user") {
    user.role="Admin";
  }else{
    user.role="user";
  }
  await user.save();
  res.status(200).json({
    success: true,
    message:"role updated",
  });
});
//delete user :todo 2
export const deleteUser = catchAsynError(async (req, res, next) => {
  const id=req.params.id

  if (!id) {
    return next(new ErrorHandler("not allowed ", 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("something wrong  contact us", 401));
  }
  //cancel subcription
  await cloudinary.v2.uploader.destroy(user.avatar[0].public_id);
  await user.remove();
  res.status(200).json({
    success: true,
    message:"user removed successfully",
  });
});
//delete user 
export const deleteMyProfile = catchAsynError(async (req, res, next) => {
  const id=req.user._id

  if (!id) {
    return next(new ErrorHandler("something wrong  contact us ", 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("something wrong  contact us", 401));
  }
  //cancel subcription
  await cloudinary.v2.uploader.destroy(user.avatar[0].public_id);
  await user.remove();
  res.status(200).cookie("token",null,{
    expires:new Date(Date.now())
  }).json({
    success: true,
    message:"user removed successfully",
  });
});