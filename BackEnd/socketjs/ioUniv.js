let io = null;

function setIO(ioInstance) {
  io = ioInstance;
  io.on("connection", (socket) => {
    socket.on("joinProject", ({ projectId }) => {
      if (projectId) socket.join(`project:${projectId}`);
    });
    socket.on("leaveProject", ({ projectId }) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });
    socket.on("disconnect", () => {});
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized yet");
  return io;
}

module.exports = { setIO, getIO };