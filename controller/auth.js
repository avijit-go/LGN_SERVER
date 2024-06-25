/** @format */

import bcrypt from "bcryptjs";
import { createError } from "../error.js";
import registerScheema from "../models/register.js";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "../helper/userHelper.js";
import Notification from "../models/notification.js";
import  mongoose from "mongoose";
// Register Admin
// validate the email address
function isValidEmail(email) {
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// Function to validate a mobile number
function isValidMobile(mobile) {
  // Regular expression pattern for validating mobile numbers
  var pattern = /^[0-9]{10}$/;
  return pattern.test(mobile);
}

// Function to validate a password
function isValidPassword(password) {
  // Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one digit
  var pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return pattern.test(password);
}
// ________________________________________________________________

export const register = async (req, res, next) => {
  const registerData = req.body;
  try {
    if (registerData.name === "" || !registerData.name) {
      return next(createError(422, "Please provide a name"));
    }
    if (registerData.email === "" || !registerData.email) {
      return next(createError(422, "Please provide a email"));
    } else if (!isValidEmail(registerData.email)) {
      return next(createError(422, "Invalid email address provided"));
    }
    if (registerData.mobile === "" || !registerData.email) {
      return next(createError(422, "Please provide a mobile number"));
    } else if (!isValidMobile(registerData.mobile)) {
      return next(createError(422, "Invalid mobile number provided"));
    }
    if (registerData.password === "" || !registerData.password) {
      return next(createError(422, "Please provide a password"));
    } else if (!isValidPassword(registerData.password)) {
      return next(createError(422, "Invalid password provided"));
    }

    const isAlreadyExistUser = await registerScheema.findOne({
      email: registerData.email,
      mobile: registerData.mobile,
    });

    if (!isAlreadyExistUser) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      const newUser = new registerScheema({ ...req.body, password: hash });
      await newUser.save();
      res
        .status(200)
        .json({
          status: "1",
          message:
            "You have been registered successfully. Please login to continue",
          id: newUser.id,
        });
    } else {
      return next(createError(403, "User already exist"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Start user Login process

export const login = async (req, res, next) => {
  console.log("*********************");
  const loginData = req.body;
  try {
    if (loginData.userName === "" || !loginData.userName) {
      return next(createError(422, "please provide a username"));
    }
    if (loginData.password === "" || !loginData.password) {
      return next(createError(422, "please provide a password"));
    } else if (!isValidPassword(loginData.password)) {
      return next(createError(422, "Invalid password provided"));
    }

    const existUser = await registerScheema.findOne({
      $or: [{ mobile: loginData.userName }, { email: loginData.userName }],
    });
    if (!existUser) {
      return next(createError(401, "Invalid username or password"));
    }

    if (existUser.status === "inactive") {
      return next(createError(401, "user not found or inactive"));
    }

    const validUser = await bcrypt.compare(
      loginData.password,
      existUser.password
    );
    if (!validUser) {
      return next(createError(401, "Invalid username or password"));
    }
    const token = jwt.sign(
      { id: existUser._id, accountType: existUser.accountType },
      process.env.JWT_SECRET
    );
    const { password: userPassword, ...others } = existUser._doc;
    res
      .status(200)
      .json({
        status: "1",
        message: "You have successfully logged in",
        user: { others },
        token: token,
      });
  } catch (error) {
    console.log(error);
    next(createError(500, "Internal server error"));
  }
};

// export const userDetails = async (req, res, next) => {

// }

export const streamerRequest = async (req, res, next) => {
  const { userId } = req.body;
  try {
    if (userId === "" || !userId) {
      return next(createError(422, "UserId is required"));
    } else if (!isValidObjectId(userId)) {
      return next(createError(400, "Invalid UserId"));
    }

    const isExistUser = await registerScheema.findOne({ _id: userId });
    if (!isExistUser) {
      return next(createError(403, "User not found"));
    }

    const options = { new: true, runValidators: true };
    const updatedUser = await registerScheema.findOneAndUpdate(
      { _id: userId }, // filter
      { accountType: "pending" }, // update
      options // options
    );

    if (!updatedUser) {
      return next(createError(404, "User not found or not updated"));
    }
    const notificationObj = Notification({
      _id: new mongoose.Types.ObjectId(),
      user: userId,
      type: 9,
      fromAdmin: false,
    });
   const userNotification =  await notificationObj.save();
    res.status(200).json({
      Success: true,
      message: "User updated successfully",
      id: updatedUser._id,
      userNotification
    });
  } catch (error) {
    console.log(error);
    return next(createError(500, "Internal server error"));
  }
};
