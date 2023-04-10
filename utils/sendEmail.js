import {createTransport} from "nodemailer"
import { catchAsynError } from "../middleware/catchAsyncError.js"

export const sendEmail=catchAsynError( async(to,subject,text)=>{
    const transport=createTransport({
        host: process.env.SMT_HOST,
        port: process.env.SMT_PORT,
        auth: {
          user: process.env.SMT_USER,
          pass: process.env.SMT_PASS
        }
      })

    await transport.sendMail({to,subject,text})
})

