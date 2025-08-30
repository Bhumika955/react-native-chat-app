import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const userSocketsMap = new Map();

export default function socketHandler(io, socket) {
  const userId = socket.user.id;
  userSocketsMap.set(userId, socket.id);

  socket.join(userId);

  socket.on("disconnect", () => {
    userSocketsMap.delete(userId);
  });

  socket.on("message:send", async (data, callback) => {
    try {
      const { conversationId, text } = data;
      if (
        !conversationId ||
        typeof conversationId !== "string" ||
        !text ||
        typeof text !== "string" ||
        text.trim().length === 0 ||
        text.length > 1000
      ) {
        return callback({ status: "error", message: "Invalid data" });
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return callback({ status: "error", message: "Conversation not found" });
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant) {
        return callback({ status: "error", message: "Access denied" });
      }

      const message = new Message({
        conversationId,
        senderId: userId,
        text: text.trim(),
        readBy: [userId],
      });

      await message.save();

      const recipientId = conversation.participants.find(
        (p) => p.toString() !== userId
      );

      const messagePayload = {
        _id: message._id,
        conversationId,
        senderId: userId,
        text: message.text,
        readBy: message.readBy,
        createdAt: message.createdAt,
      };

      // Emit to sender
      socket.emit("message:new", messagePayload);

      // Emit to recipient if connected
      if (recipientId && userSocketsMap.has(recipientId.toString())) {
        io.to(userSocketsMap.get(recipientId.toString())).emit(
          "message:new",
          messagePayload
        );
      }

      return callback({ status: "ok", message: messagePayload });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return callback({ status: "error", message: "Server error" });
    }
  });

  socket.on("typing:start", async (data) => {
    try {
      const { conversationId } = data;
      if (!conversationId || typeof conversationId !== "string") return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant) return;

      const recipientId = conversation.participants.find(
        (p) => p.toString() !== userId
      );

      if (recipientId && userSocketsMap.has(recipientId.toString())) {
        io.to(userSocketsMap.get(recipientId.toString())).emit("typing:start", {
          conversationId,
          userId,
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });

  socket.on("typing:stop", async (data) => {
    try {
      const { conversationId } = data;
      if (!conversationId || typeof conversationId !== "string") return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant) return;

      const recipientId = conversation.participants.find(
        (p) => p.toString() !== userId
      );

      if (recipientId && userSocketsMap.has(recipientId.toString())) {
        io.to(userSocketsMap.get(recipientId.toString())).emit("typing:stop", {
          conversationId,
          userId,
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });

  socket.on("message:read", async (data) => {
    try {
      const { conversationId, messageId } = data;
      if (
        !conversationId ||
        typeof conversationId !== "string" ||
        !messageId ||
        typeof messageId !== "string"
      )
        return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant) return;

      const message = await Message.findById(messageId);
      if (!message) return;

      if (!message.readBy.some((id) => id.toString() === userId)) {
        message.readBy.push(userId);
        await message.save();

        const recipientId = conversation.participants.find(
          (p) => p.toString() !== userId
        );

        // Notify other participant about read receipt update
        if (recipientId && userSocketsMap.has(recipientId.toString())) {
          io.to(userSocketsMap.get(recipientId.toString())).emit("message:read", {
            conversationId,
            messageId,
            userId,
          });
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });
}
