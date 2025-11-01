const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { ensureMember } = require("../helpers/membership");
let io = null;
require("dotenv").config();

function stripBearer(token) {
  if (!token || typeof token !== "string") return token;
  return token.startsWith("Bearer ") ? token.slice(7) : token;
}

function setIO(ioInstance) {
  io = ioInstance;

  io.on("connection", (socket) => {
    console.log("🔌 socket:connected", { sid: socket.id });
    socket.authenticated = false;
    socket.user = null;

    const authTimeout = setTimeout(() => {
      if (!socket.authenticated) {
        console.log("⏱️ socket:auth-timeout", { sid: socket.id });
        socket.emit("auth-failed", "timeout");
        socket.disconnect(true);
      }
    }, 10000);

    // legacy join/leave (kept)
    socket.on("joinProject", ({ projectId }) => {
      console.log("➡️ socket:joinProject(legacy):attempt", { sid: socket.id, projectId });
      if (projectId) {
        socket.join(`project:${projectId}`);
        console.log("✅ socket:joinProject(legacy):joined", {
          sid: socket.id,
          room: `project:${projectId}`,
          rooms: Array.from(socket.rooms || []),
        });
      }
    });

    socket.on("leaveProject", ({ projectId }) => {
      console.log("⬅️ socket:leaveProject(legacy):attempt", { sid: socket.id, projectId });
      if (projectId) {
        socket.leave(`project:${projectId}`);
        console.log("✅ socket:leaveProject(legacy):left", {
          sid: socket.id,
          room: `project:${projectId}`,
        });
      }
    });

    // auth
    socket.on("authenticate", ({ token }) => {
      console.log("🛂 socket:authenticate:received", { sid: socket.id });
      try {
        const raw = stripBearer(token);
        if (!raw) throw new Error("Missing token");
        const payload = jwt.verify(raw, process.env.SECRET_KEY);
        const userId = payload.userId || payload.id || payload.sub || payload._id;
        if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
          throw new Error("Invalid token payload");
        }
        socket.authenticated = true;
        socket.user = { userId: String(userId), name: payload.name || "" };
        clearTimeout(authTimeout);
        socket.emit("auth-success");
        console.log("✅ socket:authenticate:success", { sid: socket.id, userId: socket.user.userId });
      } catch (e) {
        console.log("❌ socket:authenticate:failed", { sid: socket.id, reason: e.message });
        try {
          clearTimeout(authTimeout);
        } catch (_) {}
        socket.emit("auth-failed", e.message || "invalid token");
        socket.disconnect(true);
      }
    });

    // validated join/leave (kept)
    socket.on("joinProject", async ({ projectId }) => {
      console.log("➡️ socket:joinProject(validated):attempt", {
        sid: socket.id,
        authed: socket.authenticated,
        projectId,
      });
      try {
        if (!socket.authenticated || !socket.user?.userId) {
          console.log("❌ socket:joinProject(validated):not-authenticated", { sid: socket.id });
          return socket.emit("auth-failed", "not authenticated");
        }
        if (!projectId || !mongoose.Types.ObjectId.isValid(String(projectId))) {
          console.log("❌ socket:joinProject(validated):invalid-projectId", { sid: socket.id, projectId });
          return socket.emit("join-error", { projectId, message: "Invalid projectId" });
        }
        const ok = await ensureMember(projectId, socket.user.userId);
        if (!ok) {
          console.log("❌ socket:joinProject(validated):forbidden", {
            sid: socket.id,
            projectId,
            userId: socket.user.userId,
          });
          return socket.emit("join-denied", { projectId, reason: "forbidden" });
        }
        socket.join(`project:${projectId}`);
        console.log("✅ socket:joinProject(validated):joined", {
          sid: socket.id,
          projectId,
          room: `project:${projectId}`,
          rooms: Array.from(socket.rooms || []),
        });
        socket.emit("joined", { projectId });
      } catch (e) {
        console.log("❌ socket:joinProject(validated):error", {
          sid: socket.id,
          projectId,
          reason: e.message,
        });
        socket.emit("join-error", { projectId, message: e.message || "Unable to join project" });
      }
    });

    socket.on("leaveProject", ({ projectId }) => {
      console.log("⬅️ socket:leaveProject(validated):attempt", { sid: socket.id, projectId });
      if (!projectId) return;
      socket.leave(`project:${projectId}`);
      console.log("✅ socket:leaveProject(validated):left", {
        sid: socket.id,
        room: `project:${projectId}`,
        rooms: Array.from(socket.rooms || []),
      });
      socket.emit("left", { projectId });
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 socket:disconnected", { sid: socket.id, reason });
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized yet");
  return io;
}

module.exports = { setIO, getIO };
