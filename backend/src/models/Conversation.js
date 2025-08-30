import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      validate: [(val) => val.length >= 2, "At least two participants required"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
