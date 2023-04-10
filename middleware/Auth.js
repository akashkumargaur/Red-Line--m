import  Jwt  from "jsonwebtoken";
import {User} from "../models/User.js"
import ErrorHandler from "../utils/errorHandler.js"
import { catchAsynError } from "../middleware/catchAsyncError.js";

export const isAuthenticated=catchAsynError(async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return next(new ErrorHandler("please logged in First",401))
    }

    const decoded=Jwt.verify(token,process.env.JWT_SECRET)

    req.user = await User.findById(decoded._id);
    next();
});

export const authorizeAdmin=catchAsynError(async(req,res,next)=>{
    if(req.user.role!="admin"){
        return next(new ErrorHandler(`${req.user.role} is not allowed to visit this page`,403))
    }
    next();
});

export const authorizeSubscriber=catchAsynError(async(req,res,next)=>{
    if(req.user.subscription.status !="active" && req.user.role!="admin"){
        return next(new ErrorHandler(`ou are not allowed till to access this right now`,403))
    }
    next();
});