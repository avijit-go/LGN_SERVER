import Question from "../models/tournamentQuestion.js";
import Wallet from "../models/wallet.js"
import mongoose from "mongoose";
import { createError } from "../error.js";
import { uploadImage } from "../helper/helper.js";

export const CreateQuestion = async (req, res, next) => {
  try {
    const files = req.files.image1;
    const temp = [];
    temp.push(req.files.image1);
    temp.push(req.files.image2);
    temp.push(req.files.image3);
    temp.push(req.files.image4);
    
    var arr = [];
    for (let i = 0; i < temp.length; i++) {
      const result = await uploadImage(temp[i]);
      arr.push(result.url);
    }
       const newQuestion = Question({
            _id: new mongoose.Types.ObjectId(),
            question: req.body.question,
            tourId: req.body.tourId,
            optionA: {
                text: req.body.opt1,
                image: arr[0]
            },
            optionB: {
                text: req.body.opt2,
                image: arr[1]
            },
            optionC: {
                text: req.body.opt3,
                image: arr[2]
            },
            optionD: {
                text: req.body.opt4,
                image: arr[3]
            },
       });
       const question = await newQuestion.save();
       req.app.get('io').to(req.body.tourId).emit('new_question', question);
       return res.status(201).json({message: "New question added", status: 201, question });
  } catch (error) {
    next(error);
  }
};

export const getTournamentQuestions = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    if (!req.params.tournametId) {
      return next(createError(422, "Please provide a password"));
    }
    const questions = await Question.find({ tourId: req.params.tournametId })
      .skip(limit * (page - 1))
      .limit(limit)
      .sort({ createdAt: -1 });
    return res
      .status(201)
      .json({ mesage: "New question added", status: 200, questions });
  } catch (error) {
    next(error);
  }
};

export const updatequestion = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(createError(422, "Please provide a password"));
    }
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return res
      .status(200)
      .json({
        message: "Question has been updated",
        sttaus: 200,
        question: updatedQuestion,
      });
  } catch (error) {
    next(error);
  }
};

export const updateQuestionStatus = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(createError(422, "Please provide a id"));
    }
    console.log("CAME HERE")
    const data = await Question.findById(req.params.id);
    if(data.correctOption.trim()) {
        const opt = `${data.correctOption}`;
        
        let users = data[opt].users;
        
        if(users.length > 0) {
          // *** Create wallet for users who give correct answer
          const operations = users.map(userId => ({
            insertOne: {
              document: {
                questionId: req.params.id,
                user: userId,
                amount: 10
              }
            }
          }));
          Wallet.bulkWrite(operations)
          .then(result => {
              console.log('Bulk write operation successful:', result);
          }).catch(error => {
              console.error('Bulk write operation failed:', error);
          });
          // *** Update leaderboard for users who give correct answer
          const leaderboardOperations = users.map(userId => ({
            updateOne: {
              filter: {
                 tournamentId: data.tourId, // Assuming you have a tournamentId field in your Question schema
                userId: userId,
                questionId: req.params.id
              },
              update: {
                $inc: { correctPredictions: 1 },
                $setOnInsert: { totalTimeSpend: 0 } // Set default value for totalTimeSpend
              },
              upsert: true
            }
          }));
          LeaderBoard.bulkWrite(leaderboardOperations)
          .then(result => {
              console.log('Leaderboard update operation successful:', result);
          }).catch(error => {
              console.error('Leaderboard update operation failed:', error);
          });
        }
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            { $set: { status: req.body.status } },
            { new: true }
        );
        return res.status(200).json({message: "Status has been updated", question: updatedQuestion });
    }
    else {
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            { $set: { status: req.body.status } },
            { new: true }
        );
        return res.status(200).json({message: "Status has been updated", question: updatedQuestion });
    }
  } catch (error) {
    next(error);
  }
};

export const updateQuestionanswer = async (req, res, next) => {
    try {
        if(!req.params.id) {
            return next(createError(422, "Please provide a id"));
        }
        const data = await Question.findByIdAndUpdate(req.params.id, {$set: {correctOption: req.body.option}}, {new: true});
        return res.status(200).json({message: "Question updated with answer", status: 200, question: data})
    } catch (error) {
       next(error) 
    }
}

export const deleteQuestion = async (req, res, next) => {
    try {
        if(!req.params.id) {
            return next(createError(422, "Please provide a id"));
        }
        const updatedData = await Question.findByIdAndUpdate(req.params.id, {$set: {isDelete: true}}, { new: true, strict: false });
        return res.status(200).json({message: "Question has been deleted", question: updatedData });
    } catch (error) {
        next(error)
    }
}