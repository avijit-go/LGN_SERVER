/** @format */

import Admin from "../models/admin.js";
import mongoose from "mongoose";
import { createError } from "../error.js";
import {
  comparePasswrd,
  generateToken,
  hashPassword,
} from "../helper/helper.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    if (!name) {
      return next(createError(422, "Please provide a name"));
    } else if (!email) {
      return next(createError(422, "Please provide a email"));
    } else if (!password) {
      return next(createError(422, "Please provide a password"));
    }
    const admin = await Admin.findOne({ email: email });
    if (admin) {
      return next(createError(422, "Admin with same email already exists"));
    }
    /* Hash password */
    const hash = await hashPassword(password);
    const newAdmin = Admin({
      _id: new mongoose.Types.ObjectId(),
      name: name,
      email: email,
      password: hash,
    });
    const adminData = await newAdmin.save();
    /* Generate token */
    const token = await generateToken(adminData);
    return res.status(201).json({
      MessageChannel: "Admin successfully registered",
      status: 201,
      admin: adminData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log("********************************************");
    if (!email) {
      return next(createError(422, "Please provide a email"));
    } else if (!password) {
      return next(createError(422, "Please provide a password"));
    }
    const admin = await Admin.findOne({ email: email });
    // console.log(admin);
    if (!admin) {
      return next(createError(422, "Admin does not exists"));
    }
    /* Compare password */
    const result = await comparePasswrd(password, admin);
    if (!result) {
      return next(createError(422, "Incorrect password"));
    }
    /* Generate token */
    const token = await generateToken(admin);
    // console.log(token);
    return res.status(201).json({
      MessageChannel: "Admin successfully loggedIn",
      status: 200,
      admin: admin,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(createError(422, "Admin id is not found"));
    }
    const admin = await Admin.findById(req.params.id).select("-password");
    return res
      .status(200)
      .json({ message: "Admin profile data", status: 200, data: admin });
  } catch (error) {
    next(error);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const updateAdmin = await Admin.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    return res.status(200).json({
      message: "Admin profile data has been updated",
      status: 200,
      data: updateAdmin,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminProfile = async (req, res, next) => {
  try {
    const deletedUser = await Admin.findByIdAndUpdate(
      req.user.id,
      { $set: { status: "delete" } },
      { new: true }
    );
    return res.status(200).json({
      message: "Admin profile has been deleted",
      status: 200,
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};
