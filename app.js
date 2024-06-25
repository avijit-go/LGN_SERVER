/** @format */

import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http"
import env from "dotenv";
import cookieParser from "cookie-parser";
import auth from "./routes/authRoutes.js";
import tournament from "./routes/tournament.js";
import profile from "./routes/profile.js";
import supportTickit from "./routes/supportTickit.js";
import fileUploader from "express-fileupload";
import cors from "cors";
import logger from "morgan";

import Admin from "./routes/admin.js";
import Banner from "./routes/banner.js";
import Question from "./routes/questions.js";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  fileUploader({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(logger("dev"));
env.config();

const server = http.createServer(app);
const port = process.env.PORT || 8080;
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your React app's URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// connect to the mongoose server

const dbConnect = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("====================================");
      console.log("Database Connected Successfully");
      console.log("====================================");
    })
    .catch((err) => {
      console.log(err);
    });
};

app.use("/api/auth", auth);
app.use("/api/tournament", tournament);
app.use("/api/profile", profile);
app.use("/api/support-tickit", supportTickit);

/* Admin's route */
app.use("/api/v1/admins", Admin);
app.use("/api/v1/banners", Banner);
app.use("/api/v1/questions", Question);

// error Handlers

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something Went Wrong";
  return res.status(status).json({
    success: false,
    message: message,
    status: status,
  });
});

// Socket Connection
app.set("io", io);
io.on("connection", (socket) => {
  /* Connect user */
  socket.on("setup", (userData) => {
    console.log("User join room with userID:", userData._id);
    socket.join(userData._id);
    socket.emit("connection");

    /* Receive notification */
    socket.on("notification send", (data) => {
      console.log("notification received", data)
      socket.in(data.user).emit("notification received", data);
    });

    // Join chat room
    socket.on("join room", (data) => {
      socket.join(data._id);
    });

    // "tournament notification"
    socket.on("tournament notification", (data) => {
      console.log("Inside room ", data)
      io.to(data.tourId).emit('message', data);
    });
  });






  /************************************************* */
  const tournamentId = socket.handshake.query.tournamentId;
  // console.log("Socket connected for tournament:", tournamentId);

  socket.join(tournamentId);

  // Notify all users in the tournament room about the new connection
  const welcomeMessage = {
    message: `A new user has joined tournament ${tournamentId}`,
  };
  io.to(tournamentId).emit("newUserConnected", welcomeMessage);

  const totalUsersCount = io.of("/").adapter.rooms.get(tournamentId)?.size;
  io.to(tournamentId).emit("totalUsers", totalUsersCount);

  socket.on("newComment", (comment) => {
    io.to(tournamentId).emit("newComment", comment);
  });

  socket.on("new_question", (question) => {
    io.to(tournamentId).emit("new_question", question);
  });
  // Handle socket disconnection if needed
  socket.on("disconnect", () => {
    console.log(`Socket disconnected for tournament: ${tournamentId}`);
    const updatedUsersCount = io.of("/").adapter.rooms.get(tournamentId)?.size;
    io.to(tournamentId).emit("totalUsers", updatedUsersCount);
  });
});

// Create server

server.listen(port, () => {
  dbConnect();
  console.log("Connected to server " + port);
});
