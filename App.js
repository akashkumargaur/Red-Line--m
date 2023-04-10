import express from "express";
import {config} from "dotenv"
import ErrorMiddlerware from "./middleware/Error.js"
import cookie_Parser from "cookie-parser"
import cors from "cors"

config({
    path:"./config/config.env"
})
const app=express()
const corsOptions ={
    origin:'*', 
    credentials:true,
    // Access-Control-Allow-Credentials: true,
    optionSuccessStatus:200,
 }
//using middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookie_Parser())


//importing and using all routes
import match from "./routes/matchRoutes.js"
import user from "./routes/userRoutes.js"
import team from "./routes/teamRoutes.js"
import other from "./routes/otherRoutes.js"

app.use("/app/v1",match)
app.use("/app/v1",user)
app.use("/app/v1",team)
app.use("/app/v1",other)

export default app;

//last
app.use(ErrorMiddlerware)
app.use(cors(corsOptions))