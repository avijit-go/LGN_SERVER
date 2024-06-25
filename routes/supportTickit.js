import express from "express";
import {varifyToken} from "../varifyToken.js";
import { createSupportTickit, getSupportTickit } from "../controller/supportTickit.js";
const router = express.Router();

router.post('/create', createSupportTickit);
router.get('/', getSupportTickit);

export default router;