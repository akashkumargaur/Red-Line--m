import { catchAsynError } from "../middleware/catchAsyncError.js";
import {Match} from '../models/Match.js'
import { User } from "../models/User.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js"
import cloudinary from "cloudinary"

// get all match
export const getAllMatch = catchAsynError( async (req, res, next) => {
    const match = await Match.find();
    res.status(200).json({
      success: true,
      match,
    });
});
//create match
export const createMatch = catchAsynError( async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const {title,description,category,noOfTeams,matchTime} = req.body;
  const file=req.file;

  if(!title || !description || !category || !noOfTeams || !file ){
    return next(new ErrorHandler("please add all field",400))
  }
  //match logo manage

  const fileUrl=getDataUri(file)

  const mycloud= await cloudinary.v2.uploader.upload(fileUrl.content)

  const match = await Match.create({
    title,
    description,
    category,
    noOfTeams,
    createdBy:user.name,
    poster:{
      public_id:mycloud.public_id,
      url:mycloud.secure_url,
    }
  });

  res.status(200).json({
    success: true,
    match,
  });
});
// get perticular match
export const getMatch = catchAsynError( async (req, res, next) => {
  const match = await Match.findById(req.params.id)

  if(!match ){
    return next(new ErrorHandler("match not Found",404))
  }

  match.views+=1;

  await match.save();

  res.status(200).json({
    success: true,
    match:match,
  });
});

//add teaam max free size 100mb
export const addTeam = catchAsynError( async (req, res, next) => {
  const {title,description} = req.body;
  const id=req.params.id;

  if(! title || !description){
    return next(new ErrorHandler("Enter title or description",404))
  }

  const match = await Match.findById(id)

  if(!match){
    return next(new ErrorHandler("match not Found",404))
  }

  //upload file here

  const file=req.file;

  const fileUrl=getDataUri(file)

  const mycloud= await cloudinary.v2.uploader.upload(fileUrl.content,{resource_type:"video",})

  match.lecture.push({
    title,
    description,
    video:{
      public_id:mycloud.public_id,
      url:mycloud.secure_url,
    }
  })

  match.noOfVideos=match.lecture.length;

  await match.save();

  res.status(200).json({
    success: true,
    message: "Lecture added successfully",
  });
});

//delete match
export const deletematch = catchAsynError( async (req, res, next) => {
  const id=req.params.id;

  const match = await Match.findById(id)

  if(!match){
    return next(new ErrorHandler("match not Found",404))
  }

  //delete file here
  await cloudinary.v2.uploader.destroy(match.poster[0].public_id)

  // for (let index = 0; index < match.lecture.length; index++) {
  //   const single = match.lecture[index];
  //   await cloudinary.v2.uploader.destroy(single.video[0].public_id,{resource_type:"video",})
  // }

  await match.remove();

  res.status(200).json({
    success: true,
    message: "match removed successfully",
  });
});

//remove team
// export const deleteLecture = catchAsynError( async (req, res, next) => {
//   const {matchId,lectureId}=req.query;

//   const match = await Match.findById(matchId)

//   if(!match){
//     return next(new ErrorHandler("match not Found",404))
//   }

//   const lecture=match.lecture.find((item)=>{
//     if(item._id.toString()===lectureId.toString()) return item;
//   })
//   //delete file here
//   await cloudinary.v2.uploader.destroy(lecture.video[0].public_id,{resource_type:"video",})
//   //remove deleted match
//   match.lecture=match.lecture.find((item)=>{
//     if(item._id.toString()!==lectureId.toString()) return item;
//   })

//   match.noOfVideos=match.lecture.length;

//   await match.save();

//   res.status(200).json({
//     success: true,
//     message: "Lecture removed successfully",
//   });
// });