const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const socketio = require("socket.io");
const { Server } = require("http");

const routes = require("./routes.js");

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@aircnc-ytpve.mongodb.net/semanaomnistack?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);

const app = express();
const server = Server(app);
const io = socketio(server);

const connectedUsers = {};

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  const { user_id } = socket.handshake.query;
  connectedUsers[user_id] = socket.id;
});

app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  return next();
});

app.use(cors());
app.use(express.json());
app.use("/files", express.static(path.resolve(__dirname, "..", "uploads")));
app.use(routes);

server.listen(3333);
