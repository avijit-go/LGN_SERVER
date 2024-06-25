/** @format */

import registerScheema from "../models/register.js";
import mongoose from "mongoose";
export const isExistUser = async (userId) => {
  try {
    const user = await registerScheema.findOne({ _id: userId });
    return user;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
