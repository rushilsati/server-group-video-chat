import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "dotenv";

config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let roomPresentor = {};

io.on("connection", (socket) => {
  socket.on("join-meet", ({ meetingCode, me }) => {
    socket.join(meetingCode);

    socket.to(meetingCode).emit("partner-connected", me);

    if (roomPresentor[meetingCode]) {
      socket.emit("screen-sharing", roomPresentor[meetingCode]);
    }

    socket.on("disconnect", () => {
      socket.to(meetingCode).emit("partner-left", me);
    });

    socket.on("screen-sharing", () => {
      socket.to(meetingCode).emit("screen-sharing", me);
      roomPresentor[meetingCode] = me;
    });

    socket.on("screen-sharing-ended", () => {
      socket.to(meetingCode).emit("screen-sharing-ended");
      delete roomPresentor[meetingCode];
    });
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server running at port ${port}`));
