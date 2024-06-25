import express from "express";
const router = express.Router();
import {register, login, getAdminProfile, updateAdminProfile, deleteAdminProfile} from "../controller/adminAuth.js";
import { authentication } from "../middleware/authentication.js";

router.post("/register", register);
router.post("/login", login);
router.get("/:id", getAdminProfile);
router.put("/update/profile", authentication, updateAdminProfile);
router.put("/delete/profile", authentication, deleteAdminProfile);

export default router