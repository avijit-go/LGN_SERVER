/** @format */

import express from "express";
import { login, register, streamerRequest } from "../controller/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/streamer-request", streamerRequest);

export default router;
