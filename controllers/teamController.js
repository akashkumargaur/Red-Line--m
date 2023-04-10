import { catchAsynError } from "../middleware/catchAsyncError.js";
import {Team} from '../models/Team.js'
import { User } from "../models/User.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js"
import cloudinary from "cloudinary"
import crypto from "crypto";

//get all team
export const getAllTeams = catchAsynError( async (req, res, next) => {
    const Teams = await Team.find();
    res.status(200).json({
      success: true,
      Teams,
    });
});

//create team  :todo imp create team again
export const createTeam = catchAsynError( async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const {name,warcry,game} = req.body;
  const file=req.file;
    if (!user) {
      return next(new ErrorHandler("no user with this Id Exist", 400));
    }
    if(!name || !warcry || !game || !file  ){
      return next(new ErrorHandler("please add all field",400))
    }
    if(user.leader.length>0 ){
      //check for old teams
      user.leader.filter((item) => {
      if (item.game.toString() == game) return next(new ErrorHandler("you are allready in a team for this game",400));
    });
    }
    //number of member
    let noOfMember

    if(game=='valorent'){
      noOfMember=6;
    }else if(game=='cod'||game=='freefire'){
      noOfMember=5;
    }
    if(noOfMember==undefined){
      return next(new ErrorHandler("please select correct game field",400))
    }

    //team logo manage
    
    const fileUrl=getDataUri(file)
  
    const mycloud= await cloudinary.v2.uploader.upload(fileUrl.content)
    
    const team = await Team.create({
      name,
      warcry,
      game,
      createdBy:user.name,
      Leader:user.name,
      noOfMember,
      poster:{
        public_id:mycloud.public_id,
        url:mycloud.secure_url,
      },
      members:{
        user_id:req.user._id,
        role:"leader",
      }
    });

    user.teams=[
      {
        team:team._id,
        game:game,
        poster:mycloud.secure_url,
      },
    ];
    user.leader=[{game},]

    await user.save()
  
    res.status(200).json({
      success: true,
      team,
    });
  });

//for share team join link :todo2
export const shareLink = catchAsynError(async (req, res, next) => {
  const user = await User.findOne(req.user._id);
  const {game} = req.body;
  if (!user) {
    return next(new ErrorHandler("no user with this Id Exist", 400));
  }
  if (!game) {
    return next(new ErrorHandler("please add all field", 400));
  }
  if (user.leader.length=0) {
    return next(new ErrorHandler("only team leader can share team link", 400));
  }

  if (user.leader.length>0) {
    //check for old teams
    user.leader.filter((item) => {
      if (item.game.toString() != game) return next(new ErrorHandler("only team leader can share team link",400));
    });
  }

  const resetToken = await user.getResetToken();

  await user.save();
  //frontend url:token
  const url = `${process.env.FRONTEND_URL}/joinMyTeam/${resetToken}`;

  const message = `click on the link to join my  team ${url}`;

  //sent Token to email
  // sendEmail(user.email, "reset Password for CourseHub Account", message);

  res.status(200).json({
    success: true,
    url:url,
    message: message,
  });
});

//for join team by link :todo
export const joinTeam = catchAsynError(async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOne(req.user._id);

  if (!user) {
    return next(new ErrorHandler("no user with this Id Exist", 400));
  }

  const shareTeamToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const team = await Team.findOne({
    shareTeamToken
  });
  if (!team) {
    return next(new ErrorHandler("Token Expire or invalid", 400));
  }
  if(team.noOfMember==team.members.length){
    return next(new ErrorHandler("Team is allready full", 400));
  }

  team.members.push({user_id:user._id});
  await team.save();

  user.teams.push({team:team.id,game:team.game,poster:team.poster[0].url});
  await user.save();

  res.status(200).json({
    success: true,
    message: "you are added to team",
  });
});

//leave team :todo
export const leaveTeam = catchAsynError(async (req, res, next) => {
  const user = await User.findOne(req.user._id);
  const teamid = await Team.findById(req.query.id);
  const team = await Team.findOne(teamid);
  if (!user) {
    return next(new ErrorHandler("no user with this Id Exist", 400));
  }
  if (!team) {
    return next(new ErrorHandler("no user with this Id Exist", 400));
  }

  const newteams = user.teams.filter((item) => {
    if (item.team.toString() !== team._id.toString()) return item;
  });
  const newmembers = team.members.filter((item) => {
    if (item.user_id.toString() !== user._id.toString()) return item;
  });
  user.teams = newteams;
  team.members=newmembers;
  await user.save();
  await team.save();

  res.status(200).json({
    success: true,
    message: "Removed from your teams",
  });
});
