/** @format */

import mongoose from "mongoose";
import { createError } from "../error.js";
import tournamentScheema from "../models/tournament.js";
import registerScheema from "../models/register.js";
import socketIoClient from "socket.io-client";
import tournamentQuestion, {
  leaderBoardScheema,
} from "../models/tournamentQuestion.js";
import Notification from "../models/notification.js";
import Question from "../models/tournamentQuestion.js";
import Prediction from "../models/prediction.js"
import { uploadImage } from "../helper/helper.js";

// Start Create Tournaments

// validate the mongodb ID
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export const createTournament = async (req, res, next) => {
  try {
    const tournamentData = req.body;
    const TournamentImage = req.files;
    console.log(TournamentImage);
    
    if (!tournamentData.title) {
      return res.status(422).json({ error: "Enter tournament title" });
    }

    if (!tournamentData.created_by) {
      return res.status(400).json({ error: "Provide user type" });
    } else if (
      tournamentData.created_by !== "admin" &&
      tournamentData.created_by !== "streamer"
    ) {
      return res
        .status(400)
        .json({ error: "You are not allowed to create a tournament" });
    }

    if (!tournamentData.streaming_link) {
      return res.status(422).json({ error: "Enter streaming link" });
    }

    if (!tournamentData.tournament_by) {
      return res.status(422).json({ error: "Provide tournament_by" });
    }

    if (!tournamentData.streaming_date) {
      return res.status(422).json({ error: "Enter streaming_date" });
    }

    if (!tournamentData.streaming_time) {
      return res.status(422).json({ error: "Enter streaming_time" });
    }

    if (!tournamentData.userId) {
      return res
        .status(422)
        .json({ error: "UserId required for create tournament" });
    } else if (!isValidObjectId(tournamentData.userId)) {
      return res
        .status(400)
        .json({ error: "Valid userId required for create tournament" });
    }
    if (!TournamentImage) {
      return next(createError(422,"Tournament Image is required"));
    }
    const result = await uploadImage(req.files.TournamentImage);

    const existUser = await registerScheema.findOne({
      _id: tournamentData.userId,
    });
    if (!existUser) {
      return res
        .status(403)
        .json({ error: "UserId invalid for create tournament" });
    }

    const existTournament = await tournamentScheema.findOne({
      title: tournamentData.title,
    });
    if (existTournament) {
      return res.status(403).json({ error: "Tournament already exists" });
    }

    const newTournament = new tournamentScheema({ image: result.url, ...req.body });
    const tournament = await newTournament.save();
    res.status(201).json({
      success: true,
      message: "Tournament added successfully",
      id: newTournament.id,
      tournament: tournament,
    });
  } catch (error) {
    console.log(error);
    next(createError(500, "Check data models and data types"));
  }
};

export const getUpcomingTournament = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const now = new Date();

    // Utility function to convert DD/MM/YYYY string to Date object
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    const allTournaments = await tournamentScheema
      .find({ is_deleted: { $ne: true } })
      .sort({ createdAt: -1 });

    // Filter results to ensure `streaming_date` is after the current date
    const filteredTournaments = allTournaments.filter(tournament => {
      const streamingDate = parseDate(tournament.streaming_date);
      return streamingDate > now;
    });

    // Apply pagination to the filtered results
    const paginatedTournaments = filteredTournaments.slice((page - 1) * limit, page * limit);

    return res.status(200).json({ status: 200, tournaments: paginatedTournaments });
  } catch (error) {
    next(error);
  }
}

export const tournamentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid tournament ID" });
    }

    const tournament = await tournamentScheema.findOne({_id: id});
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    const userdetails = await registerScheema.findOne({_id: tournament.userId});
    res.status(200).json({success:true, message: "Tournament fetch success", tournament,userdetails});
  } catch (error) {
    console.log(error);
    next(createError(500, "Failed to fetch tournament"));
  }
};

// REST API endpoint to add a comment to a specific stream (tournament)

export const Comments = async (req, res, next) => {
  const tournamentId = req.body.tournamentId;
  const { content, author } = req.body;
  
  if (!content || !author) {
    return res.status(400).json({ message: 'Content and author are required' });
  }
  
  try {
    const tournament = await tournamentScheema.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    const existUser = await registerScheema.findOne({"_id":author});
    const { password: userPassword, ...others } = existUser._doc;
   console.log(others,"sdghfjgsdjhfgdhjsfghjs");
    const newComment = { content, author, userName: others.name };
    tournament.comments.push(newComment);
    await tournament.save();
    
    // Emit the new comment to all connected clients in the room
    req.app.get('io').to(tournamentId).emit('newComment', newComment);
    
    res.status(201).json({ message: 'Comment added' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getComments = async (req, res, next) => {
  const tournamentId = req.params.tournamentId;
  try {
    const tournament = await tournamentScheema.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.json(tournament.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTournaments = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const tournaments = await tournamentScheema
      .find({ is_deleted: { $ne: true } })
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });
    return res.status(200).json({ status: 200, tournaments });
  } catch (error) {
    next(error);
  }
};

export const deleteTournament = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(404).json({ message: "Tournament ID not found" });
    }
    const updatedTornamentrData = await tournamentScheema.findByIdAndUpdate(
      req.params.id,
      { $set: { is_deleted: true } },
      { new: true }
    );
    /* Create a notification for user */
    const notificationObj = Notification({
      _id: new mongoose.Types.ObjectId(),
      user: updatedTornamentrData.userId,
      type: 8,
      fromAdmin: true,
    });
    const notificationData = await notificationObj.save();
    return res.status(200).json({
      mesage: "Tournament has been deleted",
      status: 200,
      tournment: updatedTornamentrData,
      notification: notificationData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTournamentStatus = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(404).json({ message: "Tournament ID not found" });
    }
    console.log("req.body.is_active ", req.body.is_active);
    const updatedTornamentrData = await tournamentScheema.findByIdAndUpdate(
      req.params.id,
      { $set: { is_active: req.body.is_active } },
      { new: true }
    );
    /* Create a notification for user */
    const notificationObj = Notification({
      _id: new mongoose.Types.ObjectId(),
      user: updatedTornamentrData.userId,
      type: req.body.is_active === "active" ? 6 : 7,
      fromAdmin: true,
    });
    const notificationData = await notificationObj.save();
    return res.status(200).json({
      mesage: "Tournament status has been changed",
      status: 200,
      tournment: updatedTornamentrData,
      notification: notificationData,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTournaments = async (req, res) => {
  const allTournaments = await tournamentScheema.find();
  res.status(200).json({
    success: true,
    message: "Tournament fetched successfully",
    allTournaments,
  });
};

export const storeLeaderboard = async (req, res, next) => {
  const {
    tournamentId,
    userId,
    questionId,
    correctPredictions,
    totalTimeSpend,
  } = req.body;
  console.log(req.body);
  try {
    if (tournamentId === "" || !tournamentId) {
      return next(createError(422, "Tournament id cannot be empty"));
    } else if (!isValidObjectId(tournamentId)) {
      return next(createError(400, "Invalid tournamentid"));
    }
    if (userId === "" || !userId) {
      return next(createError(422, "User id cannot be empty"));
    } else if (!isValidObjectId(userId)) {
      return next(createError(400, "Invalid userid"));
    }
    if (questionId === "" || !questionId) {
      return next(createError(422, "Question id cannot be empty"));
    } else if (!isValidObjectId(questionId)) {
      return next(createError(400, "Invalid questionid"));
    }

    const isExistUser = await registerScheema.findOne({ _id: userId });
    const isExistQuestion = await tournamentQuestion.findOne({
      _id: questionId,
    });
    const isTournamentExist = await tournamentScheema.findOne({
      _id: tournamentId,
    });

    if (!isExistUser || !isExistQuestion || !isTournamentExist) {
      return next(
        createError(400, "Invalid user or tournament or tournament question")
      );
    }
    const newLeaderBoard = await leaderBoardScheema({
      userId,
      questionId,
      tournamentId,
      correctPredictions,
      totalTimeSpend,
    });
    await newLeaderBoard.save();
    res.status(201).json({
      success: true,
      message: "Leaderboard saved successfully",
      id: newLeaderBoard._id,
    });
  } catch (error) {
    console.log("error", error);
    return next(createError(500, "something went wrong"));
  }
};

export const getAllLeaderboards = async (req, res, next) => {
  try {
    const leaderBoards = await leaderBoardScheema.find().populate("userId");
    console.log("okay");
    res.status(200).json({
      success: true,
      message: "Leaderboards fetched successfully",
      leaderboards: leaderBoards,
    });
  } catch (error) {
    console.log(error);
    return next(createError(500, "something went wrong"));
  }
};

export const getLeaderboardByTournament = async (req, res, next) => {
  const { tournamentId } = req.params;
  try {
    if (tournamentId === "" || !tournamentId) {
      return next(createError(422, "Tournamenty Id is required"));
    } else if (!isValidObjectId(tournamentId)) {
      return next(createError(400, "Invalid tournament Id"));
    }
    const leaderBoardByTournament = await leaderBoardScheema
      .find({
        tournamentId: tournamentId,
      })
      .populate("userId").populate("tournamentId").populate("questionId");
    res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully",
      leaderboard: leaderBoardByTournament,
    });
  } catch (error) {
    console.log(error);
    return next(createError(500, "Something went wrong"));
  }
};

export const getLeaderboardByUserId = async (req, res, next) => {
  const { userId } = req.params;
  try {
    if (userId === "" || !userId) {
      return next(createError(422, "userId is required"));
    } else if (!isValidObjectId(userId)) {
      return next(createError(400, "userId is not a valid"));
    }
    const leaderboardByUserId = await leaderBoardScheema.find({ userId }).populate("userId");
    res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully",
      leaderboardByUserId,
    });
  } catch (error) {
    console.log(error);
    return next(createError(500, "Something went wrong"));
  }
};

export const giveAnswer = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(createError(422, "Please provide a id"));
    }
    const questionDetails = await Question.findById(req.params.id);
    const optionField = `${req.body.optionNumber}.users`;
    console.log("optionField:", optionField);
    const result = await Question.updateOne(
      { _id: req.params.id },
      { $addToSet: { [optionField]: req.body.userId } }
    );
    const predictionData = Prediction({
      _id: new mongoose.Types.ObjectId(),
      user: req.body.userId,
      question: req.params.id,
      answer: req.body.optionNumber,
      tournament: questionDetails.tourId,
    });
    const newLeaderBoard = leaderBoardScheema({
      userId:req.body.userId,
      questionId:req.params.id,
      tournamentId:questionDetails.tourId,
      correctPredictions: questionDetails.correctOption == req.body.optionNumber,
      totalTimeSpend : 0,
    });
    await newLeaderBoard.save();
    await predictionData.save();
    return res
      .status(200)
      .json({ message: "User added to option successfully.", status: 200 });
  } catch (error) {
    next(error);
  }
};

export const getPredictionList = async(req, res, next) => {
  try {
    if (!req.params.userId) {
      return next(createError(422, "Please provide a id"));
    }
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const list = await Prediction.find({user: req.params.userId}).populate({
      path: "question",
      select: { _id: 1, question: 1 },
    }).populate({
      path: "tournament",
      select: { _id: 1, title: 1 },
    }).limit(limit).skip(limit*(page-1)).sort({createdAt: -1});
    return res.status(200).json({message: "GET prediction list", status: true, result: list})
  } catch (error) {
    next(error);
  }
}

export const getTournamentById= async(req, res, next) => {
  try {
    if (!req.params.tournamentId) {
      return next(createError(422, "Please provide a id"));
    }
    const result = await tournamentScheema.findById(req.params.tournamentId);
    return res.status(200).json({status: 200, result})
  } catch (error) {
    next(error);
  }
}