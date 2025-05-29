import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://kadarlasathvika1234:Sathvika1234@cluster0.wilzg.mongodb.net/meat-app').then(()=>console.log("DB Connected"));

}