const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { setIO } = require("./socketjs/ioUniv");
const { connectMongo } = require("./config/db");
const {auth}=require("./Middleware/middleware")
const app = express();
app.use(express.json());
app.use(cors());
const apiRoutes= require("./routes/allroute")
app.use("/forge", apiRoutes);
const port = process.env.PORT || 5001
console.log(port,"portport")
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] },
  maxHttpBufferSize: 10e6,
});
setIO(io);

(async () => {
  try {
    await connectMongo();
    server.listen(port, () => {
      console.log(`Server listening on :${port}`);
    });
  } catch (err) {
    console.error("Failed to connect MongoDB:", err.message);
    process.exit(1);
  }
})();
