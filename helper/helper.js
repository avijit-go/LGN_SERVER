import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import cloudinary from "cloudinary";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
  });

export const hashPassword = async (password) => {
    const hashPass = await bcrypt.hash(password, 10);
    return hashPass;
}

export const generateToken = async(admin) => {
    const token = await jwt.sign({id: admin._id}, process.env.JWT_SECRET, {expiresIn: "365d"});
    return token;
}

export const comparePasswrd = async(password, admin) => {
    const isCorrect = await bcrypt.compare(password, admin.password);
    return isCorrect
}

export const uploadImage = async(file)=> {
    const result = await cloudinary.uploader.upload(file.tempFilePath);
    try {
      return result;
    } catch (error) {
      return false;
    }
}
