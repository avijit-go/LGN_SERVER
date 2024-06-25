/** @format */

import express from "express";
import { varifyToken } from "../varifyToken.js";
import {
  editUser,
  getUser,
  getSearchedUser,
  getUsers,
  updateStatus,
  deleteProfile,
  updateAccountType,
  getSearchedStreamers,
  subscribe,
  follow,
} from "../controller/userDetails.js";
const router = express.Router();
import { authentication } from "../middleware/authentication.js";
import { getWallate } from "../controller/wallate.js";
import { getNotificationByUserId, getAdminNotification } from "../controller/notification.js";

router.get("/user-profile/:userId", varifyToken, getUser);
router.put("/edit-profile", varifyToken, editUser);
router.put("/search-user", getSearchedUser);
router.get("/", getUsers);
router.put("/update-status/:userId", authentication, updateStatus);
router.put("/delete-profile/:userId", authentication, deleteProfile);
router.put("/update-account-type/:userId", authentication, updateAccountType);
router.put("/search-streamers", getSearchedStreamers);
router.post("/subscribe/:userId", subscribe);
router.post("/follow/:userId", follow);
router.get("/wallate/:userId", getWallate);
router.get("/notification/:userId", getNotificationByUserId);
router.get("/admin-notification", getAdminNotification)

export default router;
