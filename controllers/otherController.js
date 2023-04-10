import { catchAsynError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js"
import { sendEmail } from "../utils/sendEmail.js";

export const contact = catchAsynError( async (req, res, next) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message ) {
      return next(new ErrorHandler("please add all field", 400));
    }
    const to=process.env.MYMAIL
    const subject="contact for Coursehub"
    const text=`I am ${name} and mail is ${email}. \n ${message}`;
  
    await sendEmail(to,subject,text);

    res.status(200).json({
      success: true,
      message:"you message is send successfully",
    });
});

export const courseRequest = catchAsynError( async (req, res, next) => {
    const { name, email, course } = req.body;
  
    if (!name || !email || !course ) {
      return next(new ErrorHandler("please add all field", 400));
    }
    const to=process.env.MYMAIL
    const subject="contact for Coursehub"
    const text=`I am ${name} and mail is ${email}. \n ${course}`;
  
    await sendEmail(to,subject,text);

    res.status(200).json({
      success: true,
      message:"you message is send successfully",
    });
});
export const getDashboardStatus = catchAsynError( async (req, res, next) => {
    const { name, email, course } = req.body;
  
    if (!name || !email || !course ) {
      return next(new ErrorHandler("please add all field", 400));
    }
    const to=process.env.MYMAIL
    const subject="contact for Coursehub"
    const text=`I am ${name} and mail is ${email}. \n ${course}`;
  
    await sendEmail(to,subject,text);

    res.status(200).json({
      success: true,
      message:"you message is send successfully",
    });
});

