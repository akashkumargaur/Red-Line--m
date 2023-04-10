import mongoose from "mongoose";

export const connectdb= async()=>{
    mongoose.set('strictQuery', true);
   const connect= await mongoose.connect(process.env.DB_URL).then((data)=>{
        console.log(`mongodb connected with ${data.connection.host}`);
        })
}