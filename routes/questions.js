import express from "express";
const router = express.Router();
import {authentication} from "../middleware/authentication.js";
import { CreateQuestion, getTournamentQuestions, updatequestion, updateQuestionStatus, updateQuestionanswer, deleteQuestion } from "../controller/questions.js";


router.post("/", authentication, CreateQuestion);
router.get("/:tournametId", authentication, getTournamentQuestions);
router.put("/:id", authentication, updatequestion);
router.put("/update-status/:id", authentication, updateQuestionStatus);
router.put("/update-answer/:id", authentication, updateQuestionanswer);
router.put("/delete-question/:id", authentication, deleteQuestion);

export default router;