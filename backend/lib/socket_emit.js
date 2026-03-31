/** @type {import("socket.io").Server | null} */
let ioRef = null;

export const setIo = (io) => {
  ioRef = io;
};

export const getIo = () => ioRef;

export const emitToUser = (userId, event, data) => {
  if (!ioRef || !userId) return;
  ioRef.to(`user:${userId}`).emit(event, data);
};
